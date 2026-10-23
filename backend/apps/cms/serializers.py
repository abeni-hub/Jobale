"""Serializers for the website content models."""

from django.conf import settings
from rest_framework import serializers

from apps.projects.models import Project
from apps.services.models import Service

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
)
from .serializers_base import (
    MediaAssetLinkMixin,
    StrictCharField,
    string_list_field,
    sanitize_url,
)


# ---------------------------------------------------------------------------
# Site settings
# ---------------------------------------------------------------------------
class SiteSettingsSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ('logo', 'logo_dark', 'favicon')
    company_name = StrictCharField(max_length=180)
    slogan = StrictCharField(max_length=255)
    social_facebook = serializers.URLField(required=False, allow_blank=True)
    social_linkedin = serializers.URLField(required=False, allow_blank=True)
    social_twitter = serializers.URLField(required=False, allow_blank=True)
    social_instagram = serializers.URLField(required=False, allow_blank=True)
    social_youtube = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = SiteSettings
        fields = (
            'id', 'company_name', 'legal_name', 'slogan', 'logo', 'logo_dark', 'favicon',
            'brand_primary', 'brand_navy', 'brand_accent', 'default_page_title',
            'default_meta_description', 'social_facebook', 'social_linkedin',
            'social_twitter', 'social_instagram', 'social_youtube', 'footer_copyright',
            'website_url', 'draft_fields', 'has_draft', 'published_at',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'draft_fields', 'has_draft', 'published_at',
                            'created_at', 'updated_at')

    def validate_brand_primary(self, value):
        return self._validate_hex(value)

    def validate_brand_navy(self, value):
        return self._validate_hex(value)

    def validate_brand_accent(self, value):
        return self._validate_hex(value)

    @staticmethod
    def _validate_hex(value):
        value = (value or '').strip()
        if not value:
            return '#086BB7'
        if not (len(value) == 7 and value.startswith('#')):
            raise serializers.ValidationError('Use a hex colour such as #086BB7.')
        try:
            int(value[1:], 16)
        except ValueError:
            raise serializers.ValidationError('Use a hex colour such as #086BB7.')
        return value.upper()


# ---------------------------------------------------------------------------
# Hero
# ---------------------------------------------------------------------------
class HeroContentSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ('hero_image', 'background_image')
    eyebrow = StrictCharField(max_length=180, required=False, allow_blank=True)
    headline = StrictCharField(max_length=180)
    headline_accent = StrictCharField(max_length=180, required=False, allow_blank=True)
    supporting_text = StrictCharField(max_length=600, required=False, allow_blank=True)

    class Meta:
        model = HeroContent
        fields = (
            'id', 'eyebrow', 'headline', 'headline_accent', 'supporting_text',
            'primary_cta_label', 'primary_cta_url', 'secondary_cta_label', 'secondary_cta_url',
            'hero_image', 'background_image', 'overlay_opacity', 'show_blueprint',
            'image_position', 'focal_x', 'focal_y', 'caption', 'slogan',
            'draft_fields', 'has_draft', 'published_at', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'draft_fields', 'has_draft', 'published_at',
                            'created_at', 'updated_at')

    def validate_overlay_opacity(self, value):
        if value is None:
            return 78
        try:
            number = int(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError('Overlay opacity must be a whole number.')
        if number < 0 or number > 100:
            raise serializers.ValidationError('Overlay opacity must be between 0 and 100.')
        return number

    def validate_focal_x(self, value):
        return max(0, min(100, int(value)))

    def validate_focal_y(self, value):
        return max(0, min(100, int(value)))

    def validate_primary_cta_url(self, value):
        return sanitize_url(value)

    def validate_secondary_cta_url(self, value):
        return sanitize_url(value)


# ---------------------------------------------------------------------------
# About
# ---------------------------------------------------------------------------
class AboutBlockSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ('image',)

    class Meta:
        model = AboutBlock
        fields = (
            'id', 'title', 'body', 'icon', 'image', 'display_order', 'is_visible',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class AboutContentSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ('main_image', 'secondary_image')
    core_values = serializers.ListField(child=serializers.DictField(), required=False, allow_empty=True)
    stats = serializers.ListField(child=serializers.DictField(), required=False, allow_empty=True)

    class Meta:
        model = AboutContent
        fields = (
            'id', 'eyebrow', 'heading', 'introduction', 'overview', 'mission', 'vision',
            'core_values', 'history', 'main_image', 'secondary_image', 'stats',
            'draft_fields', 'has_draft', 'published_at', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'draft_fields', 'has_draft', 'published_at',
                            'created_at', 'updated_at')


# ---------------------------------------------------------------------------
# Quality & safety
# ---------------------------------------------------------------------------
class QualityStandardSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ('image', 'document')

    class Meta:
        model = QualityStandard
        fields = (
            'id', 'name', 'issuing_body', 'certificate_number', 'valid_from', 'valid_until',
            'category', 'description', 'document', 'image', 'display_order', 'status',
            'internal_notes', 'is_public', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class QualityStandardPublicSerializer(serializers.ModelSerializer):
    """Public payload — internal verification notes stay private."""

    class Meta:
        model = QualityStandard
        fields = (
            'id', 'name', 'issuing_body', 'certificate_number', 'valid_from', 'valid_until',
            'category', 'description', 'document', 'image', 'display_order',
        )


class QualitySafetyContentSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ('hero_image',)
    commitments = serializers.ListField(child=serializers.DictField(), required=False,
                                        allow_empty=True)

    class Meta:
        model = QualitySafetyContent
        fields = (
            'id', 'heading', 'introduction', 'quality_assurance', 'safety_practices',
            'environmental_practices', 'commitments', 'hero_image', 'display_order',
            'draft_fields', 'has_draft', 'published_at', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'draft_fields', 'has_draft', 'published_at',
                            'created_at', 'updated_at')


# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------
class ClientReferenceSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ('logo',)
    project_name = serializers.CharField(source='project.name', read_only=True, default='')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ClientReference
        fields = (
            'id', 'name', 'logo', 'project', 'project_name', 'association', 'description',
            'display_order', 'status', 'status_display', 'internal_notes', 'show_logo',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class ClientReferencePublicSerializer(serializers.ModelSerializer):
    """Public payload — internal permission notes stay private."""

    class Meta:
        model = ClientReference
        fields = (
            'id', 'name', 'logo', 'association', 'description', 'display_order',
        )


# ---------------------------------------------------------------------------
# Testimonials
# ---------------------------------------------------------------------------
class TestimonialSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ('image',)
    project_name = serializers.CharField(source='project.name', read_only=True, default='')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Testimonial
        fields = (
            'id', 'name', 'job_title', 'organization', 'quote', 'image', 'project',
            'project_name', 'display_order', 'status', 'status_display', 'internal_notes',
            'is_verified', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class TestimonialPublicSerializer(serializers.ModelSerializer):
    """Public payload — internal notes stay private."""

    class Meta:
        model = Testimonial
        fields = (
            'id', 'name', 'job_title', 'organization', 'quote', 'image',
            'display_order',
        )


# ---------------------------------------------------------------------------
# Contact
# ---------------------------------------------------------------------------
class ContactSettingsSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ()

    class Meta:
        model = ContactSettings
        fields = (
            'id', 'heading', 'description', 'office_address', 'city', 'region', 'country',
            'phone', 'secondary_phone', 'email', 'secondary_email', 'business_hours',
            'map_url', 'map_embed_url', 'inquiry_recipient', 'form_note',
            'social_facebook', 'social_linkedin', 'social_twitter', 'social_instagram',
            'social_youtube', 'draft_fields', 'has_draft', 'published_at',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'draft_fields', 'has_draft', 'published_at',
                            'created_at', 'updated_at')

    def validate_map_url(self, value):
        return sanitize_url(value)

    def validate_map_embed_url(self, value):
        return sanitize_url(value)


# ---------------------------------------------------------------------------
# Navigation & footer
# ---------------------------------------------------------------------------
class NavigationItemSerializer(serializers.ModelSerializer):
    label = StrictCharField(max_length=80)

    class Meta:
        model = NavigationItem
        fields = (
            'id', 'label', 'url', 'display_order', 'is_visible', 'is_external',
            'open_in_new_tab', 'status', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_url(self, value):
        return sanitize_url(value)


class FooterSettingsSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ('logo',)

    class Meta:
        model = FooterSettings
        fields = (
            'id', 'description', 'logo', 'columns', 'contact_details', 'social_links',
            'copyright_text', 'legal_links', 'show_replay_intro',
            'draft_fields', 'has_draft', 'published_at', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'draft_fields', 'has_draft', 'published_at',
                            'created_at', 'updated_at')


# ---------------------------------------------------------------------------
# SEO
# ---------------------------------------------------------------------------
class SEOSettingsSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ('og_image',)

    class Meta:
        model = SEOSettings
        fields = (
            'id', 'page_title', 'meta_description', 'og_image', 'social_title',
            'social_description', 'twitter_handle', 'keywords', 'canonical_url',
            'draft_fields', 'has_draft', 'published_at', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'draft_fields', 'has_draft', 'published_at',
                            'created_at', 'updated_at')

    def validate_canonical_url(self, value):
        return sanitize_url(value)


# ---------------------------------------------------------------------------
# Page sections
# ---------------------------------------------------------------------------
class PageSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageSection
        fields = ('id', 'key', 'label', 'description', 'display_order', 'is_enabled',
                  'icon', 'updated_at')
        read_only_fields = ('id', 'key', 'updated_at')


# ---------------------------------------------------------------------------
# Services & projects (used by dashboard summaries + lookups)
# ---------------------------------------------------------------------------
class ServiceLookupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ('id', 'title', 'slug', 'status', 'icon')


class ProjectLookupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'name', 'slug', 'status', 'is_featured')
