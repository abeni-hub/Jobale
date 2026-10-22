from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsCMSAdmin

from .models import MediaAsset
from .serializers import MediaAssetSerializer


class MediaAssetViewSet(mixins.CreateModelMixin,
                        mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.UpdateModelMixin,
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    """CMS media library: upload, reuse, replace metadata, archive/delete."""

    queryset = MediaAsset.objects.all()
    serializer_class = MediaAssetSerializer
    permission_classes = [IsAuthenticated, IsCMSAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'alt_text', 'description', 'file']
    ordering_fields = ['created_at', 'title', 'size_bytes']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        instance = serializer.save(uploaded_by=self.request.user)
        f = instance.file
        if f and not instance.content_type:
            instance.content_type = getattr(f.file, 'content_type', '') or ''
            instance.save(update_fields=['content_type'])

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsCMSAdmin])
    def recent(self, request):
        assets = self.queryset[:12]
        return Response(MediaAssetSerializer(assets, many=True).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsCMSAdmin])
    def archive(self, request, pk=None):
        asset = self.get_object()
        asset.is_archived = True
        asset.save(update_fields=['is_archived', 'updated_at'])
        return Response(MediaAssetSerializer(asset).data)
