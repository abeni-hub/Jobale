"""Shared serializer helpers (media links, JSON list validation, sanitisation)."""

import re

from django.conf import settings
from rest_framework import serializers

from apps.media_library.models import MediaAsset

SCRIPT_TAG = re.compile(r'<\s*script', re.IGNORECASE)
EVENT_ATTR = re.compile(r'\son[a-z]+\s*=\s*["\'][^"\']*["\']', re.IGNORECASE)
JAVASCRIPT_URL = re.compile(r'javascript\s*:', re.IGNORECASE)


def sanitize_text(value: str) -> str:
    """
    Strip script tags, inline event handlers and javascript: URLs.

    Editors only ever enter plain text; this is a defence-in-depth measure so a
    compromised account cannot inject scripts into the public website.
    """
    if not isinstance(value, str):
        return value
    cleaned = SCRIPT_TAG.sub('', value)
    cleaned = EVENT_ATTR.sub('', cleaned)
    cleaned = JAVASCRIPT_URL.sub('', cleaned)
    return cleaned


def sanitize_url(value: str, allow_relative: bool = True) -> str:
    """Validate a link target; blocks javascript:/data: URLs."""
    if not value:
        return ''
    raw = str(value).strip()
    if not raw:
        return ''
    lowered = raw.lower()
    if lowered.startswith(('javascript:', 'data:', 'vbscript:')):
        raise serializers.ValidationError('This link type is not allowed.')
    if raw.startswith(('http://', 'https://', '/', '#', 'mailto:', 'tel:')):
        return raw
    if allow_relative:
        return '/' + raw.lstrip('/')
    raise serializers.ValidationError('Enter a valid link starting with http://, https:// or /.')


class StrictCharField(serializers.CharField):
    """CharField that rejects blank strings and HTML markup."""

    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        if '<' in value and '>' in value:
            raise serializers.ValidationError('HTML markup is not allowed in this field.')
        return sanitize_text(value)


def string_list_field(**kwargs):
    """Serializer field accepting a list of short plain-text strings."""
    child = StrictCharField(allow_blank=True, max_length=500, required=False)
    field = serializers.ListField(child=child, allow_empty=True, **kwargs)
    return field


from urllib.parse import urlparse


class FlexibleMediaField(serializers.FileField):
    """
    Serializer field for media / image fields that accepts:
    - An uploaded binary file (UploadedFile).
    - A string path or URL (e.g. '/media/projects/...', 'projects/...', or full URL).
    - None or empty string to clear the field.
    """

    def to_internal_value(self, data):
        if data is None or data == '' or data is False:
            return None if self.allow_null else ''
        if isinstance(data, str):
            val = data.strip()
            if not val:
                return None if self.allow_null else ''
            if val.startswith(('http://', 'https://')):
                val = urlparse(val).path
            if val.startswith('/media/'):
                val = val[len('/media/'):]
            elif val.startswith('media/'):
                val = val[len('media/'):]
            return val
        return super().to_internal_value(data)

    def to_representation(self, value):
        if not value:
            return None
        if isinstance(value, str):
            if value.startswith(('http://', 'https://', '/')):
                return value
            return f'/media/{value}'
        return super().to_representation(value)


class MediaAssetLinkMixin:
    """
    Adds support for reusing assets already present in the media library
    and accepting either binary file uploads or existing media URLs/paths.

    The client sends ``media_asset_ids: {"<field_name>": <asset id>}``. The
    referenced asset's file is linked to the target field (no duplicate file is
    written to disk).
    """

    media_fields: tuple = ()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['media_asset_ids'] = serializers.DictField(
            child=serializers.IntegerField(),
            write_only=True,
            required=False,
            help_text='Map of model field name -> media library asset id.',
        )
        for field_name in self.media_fields:
            if field_name in self.fields:
                orig_field = self.fields[field_name]
                self.fields[field_name] = FlexibleMediaField(
                    allow_null=getattr(orig_field, 'allow_null', True),
                    required=False,
                )

    def _apply_media_links(self, instance, links):
        if not links:
            return instance
        for field_name, asset_id in links.items():
            if field_name not in self.media_fields:
                continue
            asset = MediaAsset.objects.filter(pk=asset_id).first()
            if not asset:
                raise serializers.ValidationError(
                    {'media_asset_ids': f'Media asset {asset_id} was not found.'}
                )
            setattr(instance, field_name, asset.file.name)
        return instance

    def create(self, validated_data):
        links = validated_data.pop('media_asset_ids', None) or {}
        instance = super().create(validated_data)
        instance = self._apply_media_links(instance, links)
        if links:
            instance.save()
        return instance

    def update(self, instance, validated_data):
        links = validated_data.pop('media_asset_ids', None) or {}
        instance = super().update(instance, validated_data)
        instance = self._apply_media_links(instance, links)
        if links:
            instance.save()
        return instance


def media_url(request, field_value):
    """Return an absolute URL for a media field value."""
    if not field_value:
        return ''
    try:
        url = field_value.url
    except Exception:
        return ''
    request = request
    if request is not None:
        return request.build_absolute_uri(url)
    return url


def max_upload_mb():
    return getattr(settings, 'MAX_UPLOAD_SIZE_MB', 10)
