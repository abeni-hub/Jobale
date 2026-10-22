"""Service serializers."""

from rest_framework import serializers

from apps.cms.base import PublishStatus
from apps.cms.serializers_base import (
    MediaAssetLinkMixin,
    StrictCharField,
    string_list_field,
    sanitize_url,
)

from .models import Service


class ServiceSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ('image',)
    title = StrictCharField(max_length=180)
    summary = StrictCharField(max_length=400)
    slug = serializers.SlugField(required=False, allow_blank=True, max_length=200)
    scope = string_list_field(required=False)
    applications = string_list_field(required=False)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Service
        fields = (
            'id', 'title', 'slug', 'short_name', 'icon', 'summary', 'overview', 'scope',
            'applications', 'approach', 'quality_safety', 'image', 'cta_label', 'cta_url',
            'display_order', 'status', 'status_display', 'is_featured', 'internal_notes',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_slug(self, value):
        value = (value or '').strip().lower()
        if value and not value.replace('-', '').replace('/', '').isalnum():
            raise serializers.ValidationError('Use letters, numbers and hyphens only.')
        qs = Service.objects.filter(slug=value).exclude(pk=self.instance.pk if self.instance else None)
        if qs.exists():
            raise serializers.ValidationError('A service with this slug already exists.')
        return value

    def validate_icon(self, value):
        from apps.cms.icons import is_allowed_icon

        value = (value or 'Building2').strip()
        if not is_allowed_icon(value):
            raise serializers.ValidationError(
                'Choose one of the approved icons from the list.'
            )
        return value

    def validate_cta_url(self, value):
        return sanitize_url(value)

    def validate(self, attrs):
        status_value = attrs.get('status', getattr(self.instance, 'status', PublishStatus.DRAFT))
        if status_value == PublishStatus.PUBLISHED:
            for required in ('title', 'summary'):
                if not attrs.get(required, getattr(self.instance, required, '')):
                    raise serializers.ValidationError({required: 'This field is required to publish.'})
        return attrs


class ServicePublicSerializer(serializers.ModelSerializer):
    """Public payload — never exposes internal notes."""

    class Meta:
        model = Service
        fields = (
            'id', 'title', 'slug', 'short_name', 'icon', 'summary', 'overview', 'scope',
            'applications', 'approach', 'quality_safety', 'image', 'cta_label', 'cta_url',
            'display_order',
        )
