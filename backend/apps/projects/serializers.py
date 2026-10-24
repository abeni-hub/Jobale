"""Project serializers."""

from rest_framework import serializers

from apps.cms.base import PublishStatus
from apps.cms.serializers_base import (
    MediaAssetLinkMixin,
    StrictCharField,
    string_list_field,
)

from .models import Project, ProjectCategory, ProjectImage


class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = ('id', 'name', 'slug', 'description', 'display_order', 'is_active')
        read_only_fields = ('id', 'slug')


class ProjectImageSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ('image',)
    id = serializers.IntegerField(required=False)
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), required=False
    )

    class Meta:
        model = ProjectImage
        fields = ('id', 'project', 'image', 'caption', 'alt_text', 'display_order',
                  'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')


class ProjectSerializer(MediaAssetLinkMixin, serializers.ModelSerializer):
    media_fields = ('image',)
    name = StrictCharField(max_length=220)
    slug = serializers.SlugField(required=False, allow_blank=True, max_length=240)
    scope = string_list_field(required=False)
    specifications = string_list_field(required=False)
    gallery = ProjectImageSerializer(many=True, required=False)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    project_status_display = serializers.CharField(source='get_project_status_display',
                                                   read_only=True)

    class Meta:
        model = Project
        fields = (
            'id', 'name', 'slug', 'category', 'category_name', 'resolved_category',
            'client', 'location', 'overview', 'summary', 'description', 'scope',
            'specifications', 'image', 'gallery', 'start_date', 'completion_date',
            'project_status', 'project_status_display', 'is_featured', 'display_order',
            'status', 'status_display', 'internal_notes', 'is_verified',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def _sync_gallery(self, instance, gallery_items):
        from urllib.parse import urlparse

        keep_ids = set()
        for order, item in enumerate(gallery_items):
            item_id = item.get('id')
            raw_img = item.get('image')
            if not raw_img:
                continue

            img_val = raw_img
            if isinstance(raw_img, str):
                val = raw_img.strip()
                if val.startswith(('http://', 'https://')):
                    val = urlparse(val).path
                if val.startswith('/media/'):
                    val = val[len('/media/'):]
                elif val.startswith('media/'):
                    val = val[len('media/'):]
                img_val = val

            caption = item.get('caption', '') or ''
            alt_text = item.get('alt_text', '') or ''
            display_order = item.get('display_order', order)

            if item_id and ProjectImage.objects.filter(pk=item_id, project=instance).exists():
                pi = ProjectImage.objects.get(pk=item_id, project=instance)
                if img_val:
                    pi.image = img_val
                pi.caption = caption
                pi.alt_text = alt_text
                pi.display_order = display_order
                pi.save()
                keep_ids.add(pi.pk)
            else:
                pi = ProjectImage.objects.create(
                    project=instance,
                    image=img_val,
                    caption=caption,
                    alt_text=alt_text,
                    display_order=display_order,
                )
                keep_ids.add(pi.pk)

        instance.gallery.exclude(pk__in=keep_ids).delete()

    def create(self, validated_data):
        gallery_items = validated_data.pop('gallery', None)
        instance = super().create(validated_data)
        if gallery_items is not None:
            self._sync_gallery(instance, gallery_items)
        return instance

    def update(self, instance, validated_data):
        gallery_items = validated_data.pop('gallery', None)
        instance = super().update(instance, validated_data)
        if gallery_items is not None:
            self._sync_gallery(instance, gallery_items)
        return instance

    def validate_slug(self, value):
        value = (value or '').strip().lower()
        if value and not all(ch.isalnum() or ch in ('-', '/') for ch in value):
            raise serializers.ValidationError('Use letters, numbers and hyphens only.')
        qs = Project.objects.filter(slug=value).exclude(
            pk=self.instance.pk if self.instance else None
        )
        if qs.exists():
            raise serializers.ValidationError('A project with this slug already exists.')
        return value

    def validate(self, attrs):
        status_value = attrs.get('status', getattr(self.instance, 'status', PublishStatus.DRAFT))
        if status_value == PublishStatus.PUBLISHED:
            if not attrs.get('name', getattr(self.instance, 'name', '')):
                raise serializers.ValidationError({'name': 'A project name is required to publish.'})
            if not attrs.get('overview', getattr(self.instance, 'overview', '')) and \
                    not attrs.get('summary', getattr(self.instance, 'summary', '')):
                raise serializers.ValidationError(
                    {'overview': 'Add an overview or summary before publishing.'}
                )
        return attrs


class ProjectPublicSerializer(serializers.ModelSerializer):
    """Public payload — excludes internal notes and verification flags."""

    gallery = ProjectImageSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = (
            'id', 'name', 'slug', 'category_name', 'resolved_category', 'client',
            'location', 'overview', 'summary', 'description', 'scope', 'specifications',
            'image', 'gallery', 'start_date', 'completion_date', 'project_status',
            'is_featured', 'display_order',
        )
