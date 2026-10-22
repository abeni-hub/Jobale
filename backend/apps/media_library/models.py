"""Media asset model — the reusable asset store for the website."""

import os
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

from .validators import MaxFileSizeValidator, SafeFileExtensionValidator


def upload_to(instance, filename):
    """Store uploads under ``media/uploads/<yyyy>/<mm>/`` with a safe name."""
    ext = os.path.splitext(filename)[1].lower() or '.bin'
    base = os.path.splitext(os.path.basename(filename))[0]
    safe_base = ''.join(ch for ch in base if ch.isalnum() or ch in ('-', '_'))[:60] or 'asset'
    stamp = timezone.now().strftime('%Y/%m')
    return f'uploads/{stamp}/{safe_base}-{uuid.uuid4().hex[:8]}{ext}'


class MediaAssetQuerySet(models.QuerySet):
    def images(self):
        return self.filter(kind=MediaAsset.Kind.IMAGE)

    def documents(self):
        return self.filter(kind=MediaAsset.Kind.DOCUMENT)


class MediaAsset(models.Model):
    """An uploaded image or document that can be reused across the website."""

    class Kind(models.TextChoices):
        IMAGE = 'image', 'Image'
        DOCUMENT = 'document', 'Document'

    file = models.FileField(
        'file',
        upload_to=upload_to,
        validators=[SafeFileExtensionValidator(), MaxFileSizeValidator()],
    )
    title = models.CharField(max_length=180, blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    kind = models.CharField(max_length=16, choices=Kind.choices, default=Kind.IMAGE)
    content_type = models.CharField(max_length=120, blank=True)
    size_bytes = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_media',
    )
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Media asset'
        verbose_name_plural = 'Media assets'

    def __str__(self):
        return self.title or os.path.basename(self.file.name)

    def save(self, *args, **kwargs):
        if self.file:
            self.size_bytes = getattr(self.file, 'size', 0) or 0
            name = (self.file.name or '').lower()
            if name.endswith('.svg'):
                self.kind = self.Kind.DOCUMENT
            elif self.kind != self.Kind.DOCUMENT:
                self.kind = self.Kind.IMAGE
            if not self.title:
                self.title = os.path.basename(self.file.name)[:180]
        super().save(*args, **kwargs)

    @property
    def url(self):
        return self.file.url if self.file else ''

    @property
    def filename(self):
        return os.path.basename(self.file.name) if self.file else ''

    @property
    def extension(self):
        return os.path.splitext(self.filename)[1].lstrip('.').lower()

    @property
    def size_display(self):
        size = float(self.size_bytes or 0)
        for unit in ('B', 'KB', 'MB', 'GB'):
            if size < 1024 or unit == 'GB':
                return f'{size:.0f} {unit}' if unit == 'B' else f'{size:.1f} {unit}'
            size /= 1024
        return f'{size:.1f} GB'
