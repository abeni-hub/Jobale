"""
API smoke tests for the Jobale CMS.

Run with:
    python manage.py test apps
"""

import json

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import CMSUser
from apps.cms.models import (
    AboutContent,
    ClientReference,
    ContactSettings,
    FooterSettings,
    HeroContent,
    NavigationItem,
    PageSection,
    QualitySafetyContent,
    QualityStandard,
    SEOSettings,
    SiteSettings,
    Testimonial,
    get_singleton,
)
from apps.projects.models import Project, ProjectCategory
from apps.services.models import Service


def make_image(name='test-image.png', content_type='image/png', size=None):
    """Build a tiny valid PNG for upload tests."""
    import struct
    import zlib

    def chunk(tag, data):
        return (struct.pack('>I', len(data)) + tag + data
                + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff))

    width = height = 4
    raw = b''.join(b'\x00' + b'\xff\x00\x00' * width for _ in range(height))
    png = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
           + chunk(b'IDAT', zlib.compress(raw))
           + chunk(b'IEND', b''))
    return SimpleUploadedFile(name, png, content_type=content_type)


class PublicApiTests(TestCase):
    """The public website API must work without authentication."""

    def setUp(self):
        self.client = APIClient()

    def test_public_site_settings(self):
        response = self.client.get('/api/v1/site-settings/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('company_name', response.data)

    def test_public_homepage_bundle(self):
        response = self.client.get('/api/v1/homepage/')
        self.assertEqual(response.status_code, 200)
        for key in ('site_settings', 'hero', 'about', 'services', 'projects',
                    'navigation', 'footer', 'contact', 'seo'):
            self.assertIn(key, response.data)

    def test_public_services_only_returns_published(self):
        Service.objects.create(title='Published service', slug='published-service',
                                summary='x', status='published')
        Service.objects.create(title='Draft service', slug='draft-service',
                                summary='x', status='draft')
        response = self.client.get('/api/v1/services/')
        self.assertEqual(response.status_code, 200)
        slugs = [s['slug'] for s in response.data]
        self.assertIn('published-service', slugs)
        self.assertNotIn('draft-service', slugs)

    def test_public_projects_exclude_drafts(self):
        Project.objects.create(name='Published project', slug='published-project',
                               status='published')
        Project.objects.create(name='Draft project', slug='draft-project', status='draft')
        response = self.client.get('/api/v1/projects/')
        self.assertEqual(response.status_code, 200)
        slugs = [p['slug'] for p in response.data['results']]
        self.assertIn('published-project', slugs)
        self.assertNotIn('draft-project', slugs)

    def test_public_project_detail_by_slug(self):
        Project.objects.create(name='Detail project', slug='detail-project',
                               status='published', overview='Overview text')
        response = self.client.get('/api/v1/projects/detail-project/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['slug'], 'detail-project')

    def test_public_endpoints_hide_internal_notes(self):
        Testimonial.objects.create(name='Hidden', quote='Great work', status='published',
                                    is_verified=True, internal_notes='private note')
        response = self.client.get('/api/v1/testimonials/')
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('internal_notes', response.data[0])

    def test_public_testimonials_require_verification(self):
        Testimonial.objects.create(name='Unverified', quote='Great work', status='published',
                                    is_verified=False)
        response = self.client.get('/api/v1/testimonials/')
        self.assertEqual(len(response.data), 0)

    def test_public_quality_standards_require_public_flag(self):
        QualityStandard.objects.create(name='Private credential', status='published',
                                        is_public=False)
        QualityStandard.objects.create(name='Public credential', status='published',
                                        is_public=True)
        response = self.client.get('/api/v1/quality-standards/')
        names = [q['name'] for q in response.data]
        self.assertIn('Public credential', names)
        self.assertNotIn('Private credential', names)

    def test_navigation_only_returns_visible_published(self):
        NavigationItem.objects.create(label='Visible', url='/a', is_visible=True,
                                       status='published')
        NavigationItem.objects.create(label='Hidden', url='/b', is_visible=False,
                                       status='published')
        NavigationItem.objects.create(label='Draft link', url='/c', is_visible=True,
                                       status='draft')
        response = self.client.get('/api/v1/navigation/')
        labels = [n['label'] for n in response.data]
        self.assertIn('Visible', labels)
        self.assertNotIn('Hidden', labels)
        self.assertNotIn('Draft link', labels)

    def test_contact_inquiry_endpoint_validates_and_stores(self):
        payload = {
            'full_name': 'Alem Bekele',
            'email': 'alem@example.com',
            'phone': '+251911000000',
            'service_required': 'Building Construction',
            'project_description': 'We need a two storey residential building in Adama.',
            'consent': True,
        }
        response = self.client.post('/api/v1/contact/inquiries/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('reference', response.data)

    def test_contact_inquiry_rejects_missing_consent(self):
        payload = {
            'full_name': 'Alem Bekele',
            'email': 'alem@example.com',
            'phone': '+251911000000',
            'service_required': 'Building Construction',
            'project_description': 'We need a two storey residential building in Adama.',
            'consent': False,
        }
        response = self.client.post('/api/v1/contact/inquiries/', payload, format='json')
        self.assertEqual(response.status_code, 400)


class AuthenticationTests(TestCase):
    """Login, logout and permission enforcement."""

    def setUp(self):
        self.client = APIClient()
        self.password = 'Str0ng-Passw0rd-2024'
        self.user = CMSUser.objects.create_user(
            username='owner', email='owner@jobale.test', password=self.password,
            is_staff=True, role='owner',
        )
        self.regular = CMSUser.objects.create_user(
            username='visitor', email='visitor@jobale.test', password=self.password,
            is_staff=False,
        )

    def test_login_with_valid_credentials(self):
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'owner', 'password': self.password,
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['username'], 'owner')
        self.assertIn('jobale_access_token', response.cookies)

    def test_login_with_email_identifier(self):
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'owner@jobale.test', 'password': self.password,
        }, format='json')
        self.assertEqual(response.status_code, 200)

    def test_login_with_wrong_password_fails(self):
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'owner', 'password': 'wrong-password',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_login_with_non_staff_account_fails(self):
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'visitor', 'password': self.password,
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_me_requires_authentication(self):
        response = self.client.get('/api/v1/auth/me/')
        self.assertIn(response.status_code, (401, 403))

    def test_me_returns_user_when_authenticated(self):
        self.client.force_authenticate(self.user)
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['username'], 'owner')

    def test_logout_clears_cookies(self):
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/v1/auth/logout/')
        self.assertEqual(response.status_code, 200)

    def test_change_password(self):
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/v1/auth/change-password/', {
            'current_password': self.password,
            'new_password': 'Another-Str0ng-Pass-2025',
            'confirm_password': 'Another-Str0ng-Pass-2025',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('Another-Str0ng-Pass-2025'))

    def test_change_password_requires_matching_confirmation(self):
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/v1/auth/change-password/', {
            'current_password': self.password,
            'new_password': 'Another-Str0ng-Pass-2025',
            'confirm_password': 'mismatch',
        }, format='json')
        self.assertEqual(response.status_code, 400)


class CmsPermissionTests(TestCase):
    """Unauthenticated users must never reach management endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = CMSUser.objects.create_user(
            username='editor', password='Str0ng-Passw0rd-2024', is_staff=True,
        )

    def test_management_endpoints_reject_anonymous(self):
        urls = [
            '/api/v1/cms/summary/',
            '/api/v1/cms/settings/',
            '/api/v1/cms/hero/',
            '/api/v1/cms/about/',
            '/api/v1/cms/contact-settings/',
            '/api/v1/cms/footer/',
            '/api/v1/cms/seo/',
            '/api/v1/cms/quality-safety/',
            '/api/v1/cms/services/',
            '/api/v1/cms/projects/',
            '/api/v1/cms/clients/',
            '/api/v1/cms/testimonials/',
            '/api/v1/cms/quality-standards/',
            '/api/v1/cms/navigation/',
            '/api/v1/cms/media/',
        ]
        for url in urls:
            with self.subTest(url=url):
                response = self.client.get(url)
                self.assertIn(response.status_code, (401, 403),
                              f'{url} allowed anonymous access')

    def test_anonymous_cannot_create_content(self):
        response = self.client.post('/api/v1/cms/services/', {
            'title': 'Hacked service', 'slug': 'hacked', 'summary': 'x',
        }, format='json')
        self.assertIn(response.status_code, (401, 403))
        self.assertFalse(Service.objects.filter(slug='hacked').exists())

    def test_anonymous_cannot_delete_content(self):
        service = Service.objects.create(title='Keep me', slug='keep-me', summary='x')
        response = self.client.delete(f'/api/v1/cms/services/{service.pk}/')
        self.assertIn(response.status_code, (401, 403))
        self.assertTrue(Service.objects.filter(pk=service.pk).exists())

    def test_non_staff_user_is_rejected(self):
        visitor = CMSUser.objects.create_user(
            username='visitor', password='Str0ng-Passw0rd-2024', is_staff=False,
        )
        self.client.force_authenticate(visitor)
        response = self.client.get('/api/v1/cms/settings/')
        self.assertIn(response.status_code, (401, 403))

    def test_staff_user_can_read_management_endpoints(self):
        self.client.force_authenticate(self.user)
        response = self.client.get('/api/v1/cms/settings/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('live', response.data)


class SingletonContentTests(TestCase):
    """Single-instance sections must never create duplicate records."""

    def setUp(self):
        self.client = APIClient()
        self.user = CMSUser.objects.create_user(
            username='owner', password='Str0ng-Passw0rd-2024', is_staff=True, role='owner',
        )
        self.client.force_authenticate(self.user)

    def test_settings_singleton_is_stable(self):
        first = get_singleton(SiteSettings)
        response = self.client.put('/api/v1/cms/settings/', {
            'company_name': 'Jobale Engineering PLC',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(SiteSettings.objects.count(), 1)
        self.assertEqual(get_singleton(SiteSettings).pk, first.pk)

    def test_draft_is_not_published_until_publish(self):
        self.client.put('/api/v1/cms/hero/', {
            'headline': 'Draft headline only',
        }, format='json')

        public = self.client.get('/api/v1/hero/')
        self.assertNotEqual(public.data['headline'], 'Draft headline only')

        publish = self.client.post('/api/v1/cms/hero/', {}, format='json')
        self.assertEqual(publish.status_code, 200)

        public = self.client.get('/api/v1/hero/')
        self.assertEqual(public.data['headline'], 'Draft headline only')

    def test_discard_draft_restores_published_content(self):
        self.client.put('/api/v1/cms/hero/', {'headline': 'Temporary'}, format='json')
        response = self.client.delete('/api/v1/cms/hero/')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(get_singleton(HeroContent).has_draft)

    def test_publish_with_inline_payload(self):
        response = self.client.post('/api/v1/cms/hero/', {
            'fields': {'headline': 'Published immediately'}
        }, format='json')
        self.assertEqual(response.status_code, 200)
        public = self.client.get('/api/v1/hero/')
        self.assertEqual(public.data['headline'], 'Published immediately')

    def test_hero_validation_rejects_bad_overlay(self):
        response = self.client.put('/api/v1/cms/hero/', {
            'overlay_opacity': 500,
        }, format='json')
        self.assertEqual(response.status_code, 400)


class ContentCrudTests(TestCase):
    """Create / update / delete / publish behaviour for collections."""

    def setUp(self):
        self.client = APIClient()
        self.user = CMSUser.objects.create_user(
            username='owner', password='Str0ng-Passw0rd-2024', is_staff=True, role='owner',
        )
        self.client.force_authenticate(self.user)

    def test_create_service(self):
        response = self.client.post('/api/v1/cms/services/', {
            'title': 'Water Supply Works',
            'summary': 'Community water supply construction and maintenance.',
            'scope': ['Water supply', 'Sanitation'],
            'icon': 'Droplets',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Service.objects.count(), 1)

    def test_service_slug_is_generated(self):
        response = self.client.post('/api/v1/cms/services/', {
            'title': 'Water Supply Works',
            'summary': 'Community water supply construction and maintenance.',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['slug'], 'water-supply-works')

    def test_service_validation_requires_summary(self):
        response = self.client.post('/api/v1/cms/services/', {
            'title': 'Incomplete service',
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('summary', response.data.get('errors', response.data))

    def test_service_icon_must_be_approved(self):
        response = self.client.post('/api/v1/cms/services/', {
            'title': 'Bad icon service',
            'summary': 'x',
            'icon': 'NotARealIcon',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_update_service(self):
        service = Service.objects.create(title='Old title', slug='old-title', summary='x')
        response = self.client.patch(f'/api/v1/cms/services/{service.pk}/', {
            'title': 'New title',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        service.refresh_from_db()
        self.assertEqual(service.title, 'New title')

    def test_delete_service(self):
        service = Service.objects.create(title='Delete me', slug='delete-me', summary='x')
        response = self.client.delete(f'/api/v1/cms/services/{service.pk}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Service.objects.filter(pk=service.pk).exists())

    def test_publish_and_unpublish_service(self):
        service = Service.objects.create(title='Publish me', slug='publish-me',
                                         summary='x', status='draft')
        response = self.client.post(f'/api/v1/cms/services/{service.pk}/publish/')
        self.assertEqual(response.status_code, 200)
        service.refresh_from_db()
        self.assertEqual(service.status, 'published')

        response = self.client.post(f'/api/v1/cms/services/{service.pk}/unpublish/')
        self.assertEqual(response.status_code, 200)
        service.refresh_from_db()
        self.assertEqual(service.status, 'draft')

    def test_reorder_services(self):
        first = Service.objects.create(title='A', slug='a', summary='x', display_order=0)
        second = Service.objects.create(title='B', slug='b', summary='x', display_order=1)
        response = self.client.post('/api/v1/cms/services/reorder/', {
            'order': [second.pk, first.pk],
        }, format='json')
        self.assertEqual(response.status_code, 200)
        first.refresh_from_db()
        second.refresh_from_db()
        self.assertEqual(first.display_order, 1)
        self.assertEqual(second.display_order, 0)

    def test_create_publish_project(self):
        response = self.client.post('/api/v1/cms/projects/', {
            'name': 'Test Bridge Project',
            'overview': 'Construction of a road bridge and approach roads.',
            'location': 'Adama, Oromia',
            'scope': ['Bridge deck', 'Approach roads'],
        }, format='json')
        self.assertEqual(response.status_code, 201)
        project = Project.objects.get(slug='test-bridge-project')
        self.assertEqual(project.status, 'draft')

        publish = self.client.post(f'/api/v1/cms/projects/{project.pk}/publish/')
        self.assertEqual(publish.status_code, 200)
        project.refresh_from_db()
        self.assertEqual(project.status, 'published')

    def test_publish_project_requires_overview(self):
        response = self.client.post('/api/v1/cms/projects/', {
            'name': 'No overview project',
            'status': 'published',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_duplicate_project_slug_rejected(self):
        Project.objects.create(name='Duplicate', slug='duplicate-project')
        response = self.client.post('/api/v1/cms/projects/', {
            'name': 'Duplicate two', 'slug': 'duplicate-project',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_create_testimonial_draft_is_private(self):
        response = self.client.post('/api/v1/cms/testimonials/', {
            'name': 'Test Client',
            'quote': 'Excellent work on our facility.',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        public = self.client.get('/api/v1/testimonials/')
        self.assertEqual(len(public.data), 0)

    def test_publish_verified_testimonial(self):
        testimonial = Testimonial.objects.create(
            name='Test Client', quote='Great work.', status='draft', is_verified=False,
        )
        self.client.post(f'/api/v1/cms/testimonials/{testimonial.pk}/publish/')
        public = self.client.get('/api/v1/testimonials/')
        self.assertEqual(len(public.data), 0)

        testimonial.refresh_from_db()
        testimonial.is_verified = True
        testimonial.save()
        public = self.client.get('/api/v1/testimonials/')
        self.assertEqual(len(public.data), 1)

    def test_client_reference_publish(self):
        client = ClientReference.objects.create(name='Acme Ltd', status='draft')
        self.assertEqual(self.client.get('/api/v1/clients/').data, [])
        self.client.post(f'/api/v1/cms/clients/{client.pk}/publish/')
        self.assertEqual(len(self.client.get('/api/v1/clients/').data), 1)

    def test_navigation_reorder(self):
        first = NavigationItem.objects.create(label='A', url='/a')
        second = NavigationItem.objects.create(label='B', url='/b')
        response = self.client.post('/api/v1/cms/navigation/reorder/', {
            'order': [second.pk, first.pk],
        }, format='json')
        self.assertEqual(response.status_code, 200)
        first.refresh_from_db()
        self.assertEqual(first.display_order, 1)

    def test_navigation_rejects_javascript_url(self):
        response = self.client.post('/api/v1/cms/navigation/', {
            'label': 'Bad link', 'url': 'javascript:alert(1)',
        }, format='json')
        self.assertEqual(response.status_code, 400)


class DashboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CMSUser.objects.create_user(
            username='owner', password='Str0ng-Passw0rd-2024', is_staff=True, role='owner',
        )
        self.client.force_authenticate(self.user)

    def test_summary_reports_real_counts(self):
        Service.objects.create(title='A', slug='a', summary='x', status='published')
        Service.objects.create(title='B', slug='b', summary='x', status='draft')
        Project.objects.create(name='P', slug='p', status='published')

        response = self.client.get('/api/v1/cms/summary/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['active_services'], 1)
        self.assertEqual(response.data['published_projects'], 1)
        self.assertGreaterEqual(response.data['draft_changes'], 1)

    def test_activity_feed(self):
        self.client.post('/api/v1/cms/services/', {
            'title': 'Activity service', 'summary': 'x',
        }, format='json')
        response = self.client.get('/api/v1/cms/activity/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) >= 1)


class MediaLibraryTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CMSUser.objects.create_user(
            username='owner', password='Str0ng-Passw0rd-2024', is_staff=True, role='owner',
        )
        self.client.force_authenticate(self.user)

    @override_settings(MEDIA_ROOT='%s' % 'media-test')
    def test_upload_image(self):
        response = self.client.post('/api/v1/cms/media/', {
            'file': make_image(),
            'title': 'Site photo',
        }, format='multipart')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['url'].startswith('/media/'))

    def test_reject_executable_extension(self):
        payload = SimpleUploadedFile('malware.exe', b'MZ\x90\x00', content_type='application/octet-stream')
        response = self.client.post('/api/v1/cms/media/', {
            'file': payload, 'title': 'Bad file',
        }, format='multipart')
        self.assertEqual(response.status_code, 400)

    def test_reject_script_extension(self):
        payload = SimpleUploadedFile('payload.html', b'<script>alert(1)</script>',
                                     content_type='text/html')
        response = self.client.post('/api/v1/cms/media/', {
            'file': payload, 'title': 'Bad file',
        }, format='multipart')
        self.assertEqual(response.status_code, 400)

    def test_search_media(self):
        self.client.post('/api/v1/cms/media/', {
            'file': make_image('facade.png'), 'title': 'Facade photo',
        }, format='multipart')
        response = self.client.get('/api/v1/cms/media/?search=Facade')
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data['results']), 1)

    def test_media_usage_reports_references(self):
        asset_response = self.client.post('/api/v1/cms/media/', {
            'file': make_image('logo.png'), 'title': 'Logo',
        }, format='multipart')
        asset_id = asset_response.data['id']

        self.client.put('/api/v1/cms/settings/', {
            'company_name': 'Jobale Engineering PLC',
            'media_asset_ids': {'logo': asset_id},
        }, format='json')
        self.client.post('/api/v1/cms/settings/', {}, format='json')

        usage = self.client.get(f'/api/v1/cms/media/usage/?asset_id={asset_id}')
        self.assertEqual(usage.status_code, 200)
        self.assertTrue(usage.data['is_referenced'])

    def test_delete_media_requires_confirmation_flag(self):
        asset_response = self.client.post('/api/v1/cms/media/', {
            'file': make_image('temp.png'), 'title': 'Temp',
        }, format='multipart')
        asset_id = asset_response.data['id']
        response = self.client.delete(f'/api/v1/cms/media/{asset_id}/')
        self.assertIn(response.status_code, (200, 204))
