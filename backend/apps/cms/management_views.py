"""
Protected content-management API.

Every endpoint in this module requires an authenticated staff account
(``IsAuthenticated`` + ``IsCMSAdmin``). Object-level checks are enforced by
Django's ORM permissions and the queryset filters below — the React dashboard
is never treated as a security boundary.
"""

from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCMSAdmin
from apps.media_library.models import MediaAsset
from apps.projects.models import Project, ProjectCategory, ProjectImage
from apps.projects.serializers import (
    ProjectCategorySerializer,
    ProjectImageSerializer,
    ProjectSerializer,
)
from apps.services.models import Service
from apps.services.serializers import ServiceSerializer

from .models import (
    AboutBlock,
    AboutContent,
    ClientReference,
    ContactSettings,
    ContentActivity,
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
from .serializers import (
    AboutBlockSerializer,
    AboutContentSerializer,
    ClientReferenceSerializer,
    ContactSettingsSerializer,
    FooterSettingsSerializer,
    HeroContentSerializer,
    NavigationItemSerializer,
    PageSectionSerializer,
    QualitySafetyContentSerializer,
    QualityStandardSerializer,
    SEOSettingsSerializer,
    SiteSettingsSerializer,
    TestimonialSerializer,
)


def log_activity(request, action_name, section, summary):
    ContentActivity.objects.create(
        action=action_name,
        section=section,
        summary=summary[:255],
        actor=request.user if request.user.is_authenticated else None,
    )


def normalize_uploads(instance, validated_data):
    """
    Persist uploaded files to storage and replace them with their stored path.

    Draft snapshots are stored as JSON, so binary uploads must be written to
    the media storage first and referenced by path.
    """
    from django.core.files.storage import default_storage
    from django.core.files.uploadedfile import UploadedFile

    result = {}
    for key, value in validated_data.items():
        if not isinstance(value, UploadedFile):
            result[key] = value
            continue
        try:
            field = instance._meta.get_field(key)
        except Exception:
            result[key] = value
            continue
        filename = field.generate_filename(instance, value.name)
        stored_name = default_storage.save(filename, value)
        setattr(instance, key, stored_name)
        result[key] = stored_name
    return result


# ---------------------------------------------------------------------------
# Singleton sections (draft / publish workflow)
# ---------------------------------------------------------------------------
class SingletonContentView(APIView):
    """
    Base view for canonical, single-instance website sections.

    ``GET``    -> live content + any staged draft
    ``PUT``    -> stage a draft (never visible publicly)
    ``POST``   -> publish the staged draft (or the supplied payload)
    ``DELETE`` -> discard the staged draft
    """

    permission_classes = [IsAuthenticated, IsCMSAdmin]
    model = None
    serializer_class = None
    section_label = 'Section'
    media_fields: tuple = ()

    def get_object(self):
        return get_singleton(self.model)

    def get(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer = self.serializer_class(obj)
        data = serializer.data
        live = {k: v for k, v in data.items() if k not in ('draft_fields', 'has_draft', 'published_at')}
        return Response({
            'live': live,
            'draft': obj.draft_fields,
            'has_draft': obj.has_draft,
            'published_at': obj.published_at,
            'updated_at': obj.updated_at,
        })

    def put(self, request, *args, **kwargs):
        obj = self.get_object()
        payload = request.data.get('fields', request.data)
        serializer = self.serializer_class(obj, data=payload, partial=True)
        serializer.is_valid(raise_exception=True)
        validated = normalize_uploads(obj, dict(serializer.validated_data))
        obj.draft_fields = {k: v for k, v in validated.items() if k != 'draft_fields'}
        obj.save(update_fields=['draft_fields', 'updated_at'])
        log_activity(request, ContentActivity.Action.DRAFT, self.section_label,
                     f'Draft saved for {self.section_label}')
        return Response({
            'detail': f'Draft saved for {self.section_label}. Publish to make it live.',
            'draft': obj.draft_fields,
            'has_draft': True,
        }, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        obj = self.get_object()
        payload = request.data.get('fields')
        if payload:
            serializer = self.serializer_class(obj, data=payload, partial=True)
            serializer.is_valid(raise_exception=True)
            validated = normalize_uploads(obj, dict(serializer.validated_data))
            obj.draft_fields = {k: v for k, v in validated.items() if k != 'draft_fields'}
            obj.save(update_fields=['draft_fields', 'updated_at'])
        obj.publish_draft()
        log_activity(request, ContentActivity.Action.PUBLISHED, self.section_label,
                     f'{self.section_label} published')
        data = self.serializer_class(obj).data
        live = {k: v for k, v in data.items()
                if k not in ('draft_fields', 'has_draft', 'published_at')}
        return Response({
            'detail': f'{self.section_label} published successfully.',
            'live': live,
            'draft': None,
            'has_draft': False,
            'published_at': obj.published_at,
        }, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.draft_fields = None
        obj.save(update_fields=['draft_fields', 'updated_at'])
        log_activity(request, ContentActivity.Action.UPDATED, self.section_label,
                     f'Draft discarded for {self.section_label}')
        return Response({'detail': f'The staged draft for {self.section_label} was discarded.'})


class SiteSettingsManagementView(SingletonContentView):
    model = SiteSettings
    serializer_class = SiteSettingsSerializer
    section_label = 'Global website settings'


class HeroManagementView(SingletonContentView):
    model = HeroContent
    serializer_class = HeroContentSerializer
    section_label = 'Hero section'


class AboutManagementView(SingletonContentView):
    model = AboutContent
    serializer_class = AboutContentSerializer
    section_label = 'About Us'


class QualitySafetyManagementView(SingletonContentView):
    model = QualitySafetyContent
    serializer_class = QualitySafetyContentSerializer
    section_label = 'Quality & Safety'


class ContactSettingsManagementView(SingletonContentView):
    model = ContactSettings
    serializer_class = ContactSettingsSerializer
    section_label = 'Contact information'


class FooterManagementView(SingletonContentView):
    model = FooterSettings
    serializer_class = FooterSettingsSerializer
    section_label = 'Footer'


class SEOManagementView(SingletonContentView):
    model = SEOSettings
    serializer_class = SEOSettingsSerializer
    section_label = 'Page SEO'


# ---------------------------------------------------------------------------
# Collections
# ---------------------------------------------------------------------------
class AboutBlockViewSet(viewsets.ModelViewSet):
    queryset = AboutBlock.objects.all()
    serializer_class = AboutBlockSerializer
    permission_classes = [IsAuthenticated, IsCMSAdmin]
    pagination_class = None

    def perform_create(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.CREATED, 'About Us',
                     f'About block "{serializer.instance.title}" created')

    def perform_update(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.UPDATED, 'About Us',
                     f'About block "{serializer.instance.title}" updated')

    def perform_destroy(self, instance):
        title = instance.title
        instance.delete()
        log_activity(self.request, ContentActivity.Action.DELETED, 'About Us',
                     f'About block "{title}" deleted')


class ServiceManagementViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsCMSAdmin]
    filterset_fields = ['status', 'is_featured']
    search_fields = ['title', 'summary', 'short_name']
    ordering_fields = ['display_order', 'title', 'created_at']
    ordering = ['display_order', 'title']

    def perform_create(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.CREATED, 'Services',
                     f'Service "{serializer.instance.title}" created')

    def perform_update(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.UPDATED, 'Services',
                     f'Service "{serializer.instance.title}" updated')

    def perform_destroy(self, instance):
        title = instance.title
        instance.delete()
        log_activity(self.request, ContentActivity.Action.DELETED, 'Services',
                     f'Service "{title}" deleted')

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        service = self.get_object()
        service.status = 'published'
        service.save(update_fields=['status', 'updated_at'])
        log_activity(request, ContentActivity.Action.PUBLISHED, 'Services',
                     f'Service "{service.title}" published')
        return Response(self.get_serializer(service).data)

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        service = self.get_object()
        service.status = 'draft'
        service.save(update_fields=['status', 'updated_at'])
        log_activity(request, ContentActivity.Action.UNPUBLISHED, 'Services',
                     f'Service "{service.title}" unpublished')
        return Response(self.get_serializer(service).data)

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Persist a new display order: ``{"order": [id, id, ...]}``."""
        order = request.data.get('order') or []
        if not isinstance(order, list):
            return Response({'detail': 'Expected a list of service ids.'},
                            status=status.HTTP_400_BAD_REQUEST)
        for index, service_id in enumerate(order):
            Service.objects.filter(pk=service_id).update(display_order=index)
        log_activity(request, ContentActivity.Action.UPDATED, 'Services',
                     'Service display order updated')
        return Response(self.get_serializer(Service.objects.all(), many=True).data)


class ProjectManagementViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related('category').prefetch_related('gallery').all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsCMSAdmin]
    filterset_fields = ['status', 'is_featured', 'category']
    search_fields = ['name', 'location', 'client', 'summary']
    ordering_fields = ['display_order', 'name', 'created_at']
    ordering = ['display_order', '-created_at']

    def perform_create(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.CREATED, 'Projects',
                     f'Project "{serializer.instance.name}" created')

    def perform_update(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.UPDATED, 'Projects',
                     f'Project "{serializer.instance.name}" updated')

    def perform_destroy(self, instance):
        name = instance.name
        instance.delete()
        log_activity(self.request, ContentActivity.Action.DELETED, 'Projects',
                     f'Project "{name}" deleted')

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        project = self.get_object()
        project.status = 'published'
        project.save(update_fields=['status', 'updated_at'])
        log_activity(request, ContentActivity.Action.PUBLISHED, 'Projects',
                     f'Project "{project.name}" published')
        return Response(self.get_serializer(project).data)

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        project = self.get_object()
        project.status = 'draft'
        project.save(update_fields=['status', 'updated_at'])
        log_activity(request, ContentActivity.Action.UNPUBLISHED, 'Projects',
                     f'Project "{project.name}" unpublished')
        return Response(self.get_serializer(project).data)

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        order = request.data.get('order') or []
        if not isinstance(order, list):
            return Response({'detail': 'Expected a list of project ids.'},
                            status=status.HTTP_400_BAD_REQUEST)
        for index, project_id in enumerate(order):
            Project.objects.filter(pk=project_id).update(display_order=index)
        log_activity(request, ContentActivity.Action.UPDATED, 'Projects',
                     'Featured project order updated')
        return Response(self.get_serializer(Project.objects.all(), many=True).data)


class ProjectImageViewSet(viewsets.ModelViewSet):
    queryset = ProjectImage.objects.select_related('project').all()
    serializer_class = ProjectImageSerializer
    permission_classes = [IsAuthenticated, IsCMSAdmin]
    filterset_fields = ['project']
    pagination_class = None

    def perform_create(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.CREATED, 'Projects',
                     'Project gallery image added')

    def perform_destroy(self, instance):
        instance.delete()
        log_activity(self.request, ContentActivity.Action.DELETED, 'Projects',
                     'Project gallery image removed')


class ProjectCategoryManagementViewSet(viewsets.ModelViewSet):
    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer
    permission_classes = [IsAuthenticated, IsCMSAdmin]
    pagination_class = None


class ClientReferenceManagementViewSet(viewsets.ModelViewSet):
    queryset = ClientReference.objects.select_related('project').all()
    serializer_class = ClientReferenceSerializer
    permission_classes = [IsAuthenticated, IsCMSAdmin]
    filterset_fields = ['status']
    search_fields = ['name', 'organization', 'description']
    ordering_fields = ['display_order', 'name']
    ordering = ['display_order', 'name']

    def perform_create(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.CREATED, 'Clients & references',
                     f'Client reference "{serializer.instance.name}" created')

    def perform_update(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.UPDATED, 'Clients & references',
                     f'Client reference "{serializer.instance.name}" updated')

    def perform_destroy(self, instance):
        name = instance.name
        instance.delete()
        log_activity(self.request, ContentActivity.Action.DELETED, 'Clients & references',
                     f'Client reference "{name}" deleted')

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        obj = self.get_object()
        obj.status = 'published'
        obj.save(update_fields=['status', 'updated_at'])
        log_activity(request, ContentActivity.Action.PUBLISHED, 'Clients & references',
                     f'Client reference "{obj.name}" published')
        return Response(self.get_serializer(obj).data)

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        obj = self.get_object()
        obj.status = 'draft'
        obj.save(update_fields=['status', 'updated_at'])
        log_activity(request, ContentActivity.Action.UNPUBLISHED, 'Clients & references',
                     f'Client reference "{obj.name}" unpublished')
        return Response(self.get_serializer(obj).data)


class QualityStandardManagementViewSet(viewsets.ModelViewSet):
    queryset = QualityStandard.objects.all()
    serializer_class = QualityStandardSerializer
    permission_classes = [IsAuthenticated, IsCMSAdmin]
    filterset_fields = ['status', 'is_public']
    search_fields = ['name', 'issuing_body', 'certificate_number']
    ordering_fields = ['display_order', 'name']
    ordering = ['display_order', 'name']

    def perform_create(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.CREATED, 'Quality & Safety',
                     f'Quality standard "{serializer.instance.name}" created')

    def perform_update(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.UPDATED, 'Quality & Safety',
                     f'Quality standard "{serializer.instance.name}" updated')

    def perform_destroy(self, instance):
        name = instance.name
        instance.delete()
        log_activity(self.request, ContentActivity.Action.DELETED, 'Quality & Safety',
                     f'Quality standard "{name}" deleted')

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        obj = self.get_object()
        obj.status = 'published'
        obj.save(update_fields=['status', 'updated_at'])
        log_activity(request, ContentActivity.Action.PUBLISHED, 'Quality & Safety',
                     f'Quality standard "{obj.name}" published')
        return Response(self.get_serializer(obj).data)

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        obj = self.get_object()
        obj.status = 'draft'
        obj.save(update_fields=['status', 'updated_at'])
        log_activity(request, ContentActivity.Action.UNPUBLISHED, 'Quality & Safety',
                     f'Quality standard "{obj.name}" unpublished')
        return Response(self.get_serializer(obj).data)


class TestimonialManagementViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.select_related('project').all()
    serializer_class = TestimonialSerializer
    permission_classes = [IsAuthenticated, IsCMSAdmin]
    filterset_fields = ['status', 'is_verified']
    search_fields = ['name', 'organization', 'quote']
    ordering_fields = ['display_order', 'name', 'created_at']
    ordering = ['display_order', 'name']

    def perform_create(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.CREATED, 'Testimonials',
                     f'Testimonial from "{serializer.instance.name}" created')

    def perform_update(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.UPDATED, 'Testimonials',
                     f'Testimonial from "{serializer.instance.name}" updated')

    def perform_destroy(self, instance):
        name = instance.name
        instance.delete()
        log_activity(self.request, ContentActivity.Action.DELETED, 'Testimonials',
                     f'Testimonial from "{name}" deleted')

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        obj = self.get_object()
        obj.status = 'published'
        obj.save(update_fields=['status', 'updated_at'])
        log_activity(request, ContentActivity.Action.PUBLISHED, 'Testimonials',
                     f'Testimonial from "{obj.name}" published')
        return Response(self.get_serializer(obj).data)

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        obj = self.get_object()
        obj.status = 'draft'
        obj.save(update_fields=['status', 'updated_at'])
        log_activity(request, ContentActivity.Action.UNPUBLISHED, 'Testimonials',
                     f'Testimonial from "{obj.name}" unpublished')
        return Response(self.get_serializer(obj).data)


class NavigationManagementViewSet(viewsets.ModelViewSet):
    queryset = NavigationItem.objects.all()
    serializer_class = NavigationItemSerializer
    permission_classes = [IsAuthenticated, IsCMSAdmin]
    filterset_fields = ['is_visible', 'status']
    search_fields = ['label', 'url']
    ordering_fields = ['display_order', 'label']
    ordering = ['display_order', 'label']
    pagination_class = None

    def perform_create(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.CREATED, 'Navigation',
                     f'Navigation item "{serializer.instance.label}" created')

    def perform_update(self, serializer):
        serializer.save()
        log_activity(self.request, ContentActivity.Action.UPDATED, 'Navigation',
                     f'Navigation item "{serializer.instance.label}" updated')

    def perform_destroy(self, instance):
        label = instance.label
        instance.delete()
        log_activity(self.request, ContentActivity.Action.DELETED, 'Navigation',
                     f'Navigation item "{label}" deleted')

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        order = request.data.get('order') or []
        if not isinstance(order, list):
            return Response({'detail': 'Expected a list of navigation item ids.'},
                            status=status.HTTP_400_BAD_REQUEST)
        for index, item_id in enumerate(order):
            NavigationItem.objects.filter(pk=item_id).update(display_order=index)
        log_activity(request, ContentActivity.Action.UPDATED, 'Navigation',
                     'Navigation order updated')
        return Response(self.get_serializer(NavigationItem.objects.all(), many=True).data)


class PageSectionManagementViewSet(viewsets.ModelViewSet):
    queryset = PageSection.objects.all()
    serializer_class = PageSectionSerializer
    permission_classes = [IsAuthenticated, IsCMSAdmin]
    pagination_class = None

    def get_queryset(self):
        return PageSection.objects.all().order_by('display_order', 'label')


# ---------------------------------------------------------------------------
# Dashboard summary
# ---------------------------------------------------------------------------
class DashboardSummaryView(APIView):
    """Real statistics for the dashboard overview screen."""

    permission_classes = [IsAuthenticated, IsCMSAdmin]

    def get(self, request):
        from apps.projects.models import Project

        singletons = {
            'site_settings': SiteSettings,
            'hero': HeroContent,
            'about': AboutContent,
            'quality_safety': QualitySafetyContent,
            'contact_settings': ContactSettings,
            'footer': FooterSettings,
            'seo': SEOSettings,
        }

        draft_count = 0
        published_sections = 0
        for model in singletons.values():
            obj = model.objects.first()
            if not obj:
                continue
            if obj.draft_fields:
                draft_count += 1
            else:
                published_sections += 1

        draft_count += (
            Service.objects.filter(status='draft').count()
            + Project.objects.filter(status='draft').count()
            + Testimonial.objects.filter(status='draft').count()
            + ClientReference.objects.filter(status='draft').count()
            + QualityStandard.objects.filter(status='draft').count()
        )

        enabled_sections = PageSection.objects.filter(is_enabled=True).count()

        last_activity = ContentActivity.objects.select_related('actor').first()
        last_content_update = None
        for model in list(singletons.values()) + [Service, Project, Testimonial,
                                                  ClientReference, QualityStandard]:
            latest = model.objects.order_by('-updated_at').first()
            if latest and (last_content_update is None or latest.updated_at > last_content_update):
                last_content_update = latest.updated_at

        media_count = MediaAsset.objects.count()

        return Response({
            'published_sections': published_sections,
            'enabled_sections': enabled_sections,
            'draft_changes': draft_count,
            'published_projects': Project.objects.filter(status='published').count(),
            'featured_projects': Project.objects.filter(status='published', is_featured=True).count(),
            'draft_projects': Project.objects.filter(status='draft').count(),
            'active_services': Service.objects.filter(status='published').count(),
            'draft_services': Service.objects.filter(status='draft').count(),
            'published_clients': ClientReference.objects.filter(status='published').count(),
            'published_testimonials': Testimonial.objects.filter(
                status='published', is_verified=True).count(),
            'quality_standards': QualityStandard.objects.filter(status='published').count(),
            'media_assets': media_count,
            'last_content_update': last_content_update,
            'last_activity': (
                {
                    'action': last_activity.action,
                    'section': last_activity.section,
                    'summary': last_activity.summary,
                    'actor': (last_activity.actor.get_full_name() or last_activity.actor.username)
                    if last_activity.actor else '',
                    'created_at': last_activity.created_at,
                }
                if last_activity else None
            ),
        })


class ContentActivityView(APIView):
    """Recent content activity feed for the dashboard."""

    permission_classes = [IsAuthenticated, IsCMSAdmin]

    def get(self, request):
        limit = min(int(request.query_params.get('limit', 20)), 100)
        items = ContentActivity.objects.select_related('actor')[:limit]
        return Response([
            {
                'id': item.id,
                'action': item.action,
                'section': item.section,
                'summary': item.summary,
                'actor': (item.actor.get_full_name() or item.actor.username)
                if item.actor else 'System',
                'created_at': item.created_at,
            }
            for item in items
        ])


class MediaUsageView(APIView):
    """Reports which published content still references a media asset."""

    permission_classes = [IsAuthenticated, IsCMSAdmin]

    def get(self, request):
        asset_id = request.query_params.get('asset_id')
        if not asset_id:
            return Response({'detail': 'asset_id is required.'},
                            status=status.HTTP_400_BAD_REQUEST)
        asset = MediaAsset.objects.filter(pk=asset_id).first()
        if not asset:
            return Response({'detail': 'Media asset not found.'},
                            status=status.HTTP_404_NOT_FOUND)

        references = []
        for model, label in (
            (SiteSettings, 'Global settings'),
            (HeroContent, 'Hero'),
            (AboutContent, 'About'),
            (QualitySafetyContent, 'Quality & Safety'),
            (FooterSettings, 'Footer'),
            (SEOSettings, 'SEO'),
            (Service, 'Service'),
            (Project, 'Project'),
            (Testimonial, 'Testimonial'),
            (ClientReference, 'Client reference'),
            (QualityStandard, 'Quality standard'),
        ):
            file_fields = [
                field for field in model._meta.fields
                if field.get_internal_type() in ('ImageField', 'FileField')
            ]
            if not file_fields:
                continue
            instances = model.objects.all()
            for instance in instances:
                for field in file_fields:
                    try:
                        value = getattr(instance, field.attname, None)
                        if asset.file.name and value == asset.file.name:
                            references.append({
                                'section': label,
                                'field': field.name,
                                'object_id': instance.pk,
                                'object_label': str(instance),
                            })
                    except Exception:
                        continue
        return Response({'asset_id': asset.id, 'references': references,
                         'is_referenced': len(references) > 0})
