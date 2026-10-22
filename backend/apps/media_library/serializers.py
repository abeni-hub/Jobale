from rest_framework import serializers

from .models import MediaAsset


class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.CharField(read_only=True)
    filename = serializers.CharField(read_only=True)
    extension = serializers.CharField(read_only=True)
    size_display = serializers.CharField(read_only=True)
    kind_display = serializers.CharField(source='get_kind_display', read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = (
            'id',
            'file',
            'url',
            'title',
            'alt_text',
            'description',
            'kind',
            'kind_display',
            'content_type',
            'size_bytes',
            'size_display',
            'extension',
            'filename',
            'uploaded_by_name',
            'is_archived',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'url', 'kind', 'content_type', 'size_bytes',
                            'filename', 'extension', 'size_display', 'created_at', 'updated_at')

    def get_uploaded_by_name(self, obj):
        return obj.uploaded_by.get_full_name() or obj.uploaded_by.username if obj.uploaded_by else ''

    def validate_file(self, value):
        from .validators import validate_image_content

        name = (value.name or '').lower()
        if name.endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif')):
            validate_image_content(value.file)
        return value
