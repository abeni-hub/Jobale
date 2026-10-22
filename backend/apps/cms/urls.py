"""
URL routes for the CMS API.

Public content: ``/api/v1/...``
Protected management: ``/api/v1/cms/...``
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.media_library.views import MediaAssetViewSet

from .management_views import (
    AboutBlockViewSet,
    AboutManagementView,
    ClientReferenceManagementViewSet,
    ContactSettingsManagementView,
    ContentActivityView,
    DashboardSummaryView,
    FooterManagementView,
    HeroManagementView,
    MediaUsageView,
    NavigationManagementViewSet,
    PageSectionManagementViewSet,
    ProjectCategoryManagementViewSet,
    ProjectImageViewSet,
    ProjectManagementViewSet,
    QualitySafetyManagementView,
    QualityStandardManagementViewSet,
    SEOManagementView,
    ServiceManagementViewSet,
    SiteSettingsManagementView,
    TestimonialManagementViewSet,
)
from .views import (
    HomePageView,
    PublicAboutBlocksView,
    PublicAboutView,
    PublicClientsView,
    PublicContactSettingsView,
    PublicFooterView,
    PublicHeroView,
    PublicNavigationView,
    PublicPageSectionsView,
    PublicProjectCategoryView,
    PublicProjectViewSet,
    PublicQualitySafetyView,
    PublicQualityStandardsView,
    PublicSEOSettingsView,
    PublicServiceViewSet,
    PublicSiteSettingsView,
    PublicTestimonialsView,
)
from .contact_views import ContactInquiryView

router = DefaultRouter()
router.register(r'services', PublicServiceViewSet, basename='public-service')
router.register(r'projects', PublicProjectViewSet, basename='public-project')

cms_router = DefaultRouter()
cms_router.register(r'services', ServiceManagementViewSet, basename='cms-service')
cms_router.register(r'projects', ProjectManagementViewSet, basename='cms-project')
cms_router.register(r'project-images', ProjectImageViewSet, basename='cms-project-image')
cms_router.register(r'project-categories', ProjectCategoryManagementViewSet,
                    basename='cms-project-category')
cms_router.register(r'clients', ClientReferenceManagementViewSet, basename='cms-client')
cms_router.register(r'quality-standards', QualityStandardManagementViewSet,
                    basename='cms-quality-standard')
cms_router.register(r'testimonials', TestimonialManagementViewSet, basename='cms-testimonial')
cms_router.register(r'navigation', NavigationManagementViewSet, basename='cms-navigation')
cms_router.register(r'about-blocks', AboutBlockViewSet, basename='cms-about-block')
cms_router.register(r'sections', PageSectionManagementViewSet, basename='cms-section')
cms_router.register(r'media', MediaAssetViewSet, basename='cms-media')

urlpatterns = [
    # Public
    path('site-settings/', PublicSiteSettingsView.as_view(), name='public-site-settings'),
    path('homepage/', HomePageView.as_view(), name='public-homepage'),
    path('sections/', PublicPageSectionsView.as_view(), name='public-sections'),
    path('hero/', PublicHeroView.as_view(), name='public-hero'),
    path('about/', PublicAboutView.as_view(), name='public-about'),
    path('about/blocks/', PublicAboutBlocksView.as_view(), name='public-about-blocks'),
    path('quality-safety/', PublicQualitySafetyView.as_view(), name='public-quality-safety'),
    path('quality-standards/', PublicQualityStandardsView.as_view(), name='public-quality-standards'),
    path('clients/', PublicClientsView.as_view(), name='public-clients'),
    path('testimonials/', PublicTestimonialsView.as_view(), name='public-testimonials'),
    path('contact-settings/', PublicContactSettingsView.as_view(), name='public-contact-settings'),
    path('navigation/', PublicNavigationView.as_view(), name='public-navigation'),
    path('footer/', PublicFooterView.as_view(), name='public-footer'),
    path('seo/', PublicSEOSettingsView.as_view(), name='public-seo'),
    path('project-categories/', PublicProjectCategoryView.as_view(),
         name='public-project-categories'),
    path('contact/inquiries/', ContactInquiryView.as_view(), name='public-inquiries'),
    path('', include(router.urls)),

    # Protected CMS
    path('cms/summary/', DashboardSummaryView.as_view(), name='cms-summary'),
    path('cms/activity/', ContentActivityView.as_view(), name='cms-activity'),
    path('cms/media/usage/', MediaUsageView.as_view(), name='cms-media-usage'),
    path('cms/settings/', SiteSettingsManagementView.as_view(), name='cms-settings'),
    path('cms/hero/', HeroManagementView.as_view(), name='cms-hero'),
    path('cms/about/', AboutManagementView.as_view(), name='cms-about'),
    path('cms/quality-safety/', QualitySafetyManagementView.as_view(),
         name='cms-quality-safety'),
    path('cms/contact-settings/', ContactSettingsManagementView.as_view(),
         name='cms-contact-settings'),
    path('cms/footer/', FooterManagementView.as_view(), name='cms-footer'),
    path('cms/seo/', SEOManagementView.as_view(), name='cms-seo'),
    path('cms/', include(cms_router.urls)),
]
