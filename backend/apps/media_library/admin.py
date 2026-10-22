from django.contrib import admin

from .models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ('title', 'kind', 'filename', 'size_display', 'uploaded_by', 'created_at')
    list_filter = ('kind', 'is_archived')
    search_fields = ('title', 'alt_text', 'description')
