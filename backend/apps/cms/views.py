"""Public read-only API used by the React website."""

from django.db.models import Q
from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.projects.models import Project, ProjectCategory
from apps.projects.serializers import ProjectCategorySerializer, ProjectPublicSerializer
from apps.services.models import Service
from apps.services.serializers import ServicePublicSerializer

from .models import (
    AboutBlock,
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
from .serializers import (
    AboutBlockSerializer,
    AboutContentSerializer,
    ClientReferencePublicSerializer,
    ContactSettingsSerializer,
    FooterSettingsSerializer,
    HeroContentSerializer,
    NavigationItemSerializer,
    PageSectionSerializer,
    QualitySafetyContentSerializer,
    QualityStandardPublicSerializer,
    SEOSettingsSerializer,
    SiteSettingsSerializer,
    TestimonialPublicSerializer,
)


class PublicSiteSettingsView(generics.RetrieveAPIView):
    """Global website settings (company name, logo, social links, defaults)."""

    serializer_class = SiteSettingsSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return get_singleton(SiteSettings)


class PublicHeroView(generics.RetrieveAPIView):
    serializer_class = HeroContentSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return get_singleton(HeroContent)


class PublicAboutView(generics.RetrieveAPIView):
    serializer_class = AboutContentSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return get_singleton(AboutContent)


class PublicAboutBlocksView(generics.ListAPIView):
    serializer_class = AboutBlockSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    queryset = AboutBlock.objects.filter(is_visible=True)


class PublicQualitySafetyView(generics.RetrieveAPIView):
    serializer_class = QualitySafetyContentSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return get_singleton(QualitySafetyContent)


class PublicQualityStandardsView(generics.ListAPIView):
    serializer_class = QualityStandardPublicSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return QualityStandard.objects.filter(
            status='published', is_public=True
        ).order_by('display_order', 'id')


class PublicClientsView(generics.ListAPIView):
    serializer_class = ClientReferencePublicSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return ClientReference.objects.filter(status='published').order_by('display_order', 'id')


class PublicTestimonialsView(generics.ListAPIView):
    serializer_class = TestimonialPublicSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Testimonial.objects.filter(status='published', is_verified=True).order_by(
            'display_order', 'id'
        )


class PublicContactSettingsView(generics.RetrieveAPIView):
    serializer_class = ContactSettingsSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return get_singleton(ContactSettings)


class PublicFooterView(generics.RetrieveAPIView):
    serializer_class = FooterSettingsSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return get_singleton(FooterSettings)


class PublicSEOSettingsView(generics.RetrieveAPIView):
    serializer_class = SEOSettingsSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return get_singleton(SEOSettings)


class PublicNavigationView(generics.ListAPIView):
    serializer_class = NavigationItemSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return NavigationItem.objects.filter(
            is_visible=True, status='published'
        ).order_by('display_order', 'id')


class PublicPageSectionsView(generics.ListAPIView):
    serializer_class = PageSectionSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return PageSection.objects.filter(is_enabled=True)


class PublicServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """Published services only."""

    serializer_class = ServicePublicSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Service.objects.published()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__iexact=category)
        return queryset.order_by('display_order', 'title')


class PublicProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """Published projects only — never exposes drafts."""

    serializer_class = ProjectPublicSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Project.objects.published().select_related('category').prefetch_related('gallery')
        params = self.request.query_params

        category = params.get('category')
        if category:
            queryset = queryset.filter(
                Q(category__name__iexact=category) | Q(category_name__iexact=category)
            )

        featured = params.get('featured')
        if featured in ('1', 'true', 'True'):
            queryset = queryset.filter(is_featured=True)

        search = params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(location__icontains=search)
                | Q(client__icontains=search)
                | Q(summary__icontains=search)
            )

        return queryset.order_by('display_order', '-created_at')


class PublicProjectCategoryView(generics.ListAPIView):
    serializer_class = ProjectCategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return ProjectCategory.objects.filter(is_active=True)


class HomePageView(APIView):
    """Single request that powers the homepage and shared layout sections."""

    permission_classes = [AllowAny]

    def get(self, request):
        settings_obj = get_singleton(SiteSettings)
        hero = get_singleton(HeroContent)
        about = get_singleton(AboutContent)
        quality = get_singleton(QualitySafetyContent)
        contact = get_singleton(ContactSettings)
        footer = get_singleton(FooterSettings)
        seo = get_singleton(SEOSettings)

        services = Service.objects.published().order_by('display_order', 'title')
        projects = (
            Project.objects.published()
            .select_related('category')
            .prefetch_related('gallery')
            .order_by('display_order', '-created_at')
        )
        featured_projects = [p for p in projects if p.is_featured][:6] or list(projects)[:6]
        clients = ClientReference.objects.filter(status='published').order_by('display_order', 'id')
        testimonials = Testimonial.objects.filter(
            status='published', is_verified=True
        ).order_by('display_order', 'id')
        standards = QualityStandard.objects.filter(
            status='published', is_public=True
        ).order_by('display_order', 'id')
        navigation = NavigationItem.objects.filter(
            is_visible=True, status='published'
        ).order_by('display_order', 'id')

        return Response({
            'site_settings': SiteSettingsSerializer(settings_obj).data,
            'hero': HeroContentSerializer(hero).data,
            'about': AboutContentSerializer(about).data,
            'about_blocks': AboutBlockSerializer(
                AboutBlock.objects.filter(is_visible=True), many=True
            ).data,
            'quality_safety': QualitySafetyContentSerializer(quality).data,
            'quality_standards': QualityStandardPublicSerializer(standards, many=True).data,
            'services': ServicePublicSerializer(services, many=True).data,
            'projects': ProjectPublicSerializer(projects, many=True).data,
            'featured_projects': ProjectPublicSerializer(featured_projects, many=True).data,
            'project_categories': [
                {'id': c.id, 'name': c.name, 'slug': c.slug}
                for c in ProjectCategory.objects.filter(is_active=True)
            ],
            'clients': ClientReferencePublicSerializer(clients, many=True).data,
            'testimonials': TestimonialPublicSerializer(testimonials, many=True).data,
            'contact': ContactSettingsSerializer(contact).data,
            'footer': FooterSettingsSerializer(footer).data,
            'navigation': NavigationItemSerializer(navigation, many=True).data,
            'seo': SEOSettingsSerializer(seo).data,
        })
