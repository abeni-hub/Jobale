"""Base models and shared helpers for the CMS content apps."""

from django.db import models
from django.utils import timezone


class PublishStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    PUBLISHED = 'published', 'Published'
    ARCHIVED = 'archived', 'Archived'


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class DraftableMixin(models.Model):
    """
    Adds draft/publish support to canonical (single-instance) sections.

    The live field values are always the *published* content. Staged edits are
    stored as a JSON snapshot in ``draft_fields`` so that a draft never leaks
    to the public API until it is explicitly published.
    """

    draft_fields = models.JSONField(
        'staged draft',
        null=True,
        blank=True,
        default=None,
        help_text='Unsaved working copy. Only published content is served publicly.',
    )
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

    @property
    def has_draft(self) -> bool:
        return bool(self.draft_fields)

    def stage_draft(self, payload: dict) -> None:
        self.draft_fields = payload
        self.save(update_fields=['draft_fields', 'updated_at'])

    def publish_draft(self) -> None:
        """Copy the staged draft into the live fields and clear the draft."""
        if not self.draft_fields:
            self.published_at = timezone.now()
            self.save(update_fields=['published_at', 'updated_at'])
            return

        payload = dict(self.draft_fields)
        media_links = payload.pop('media_asset_ids', None) or {}

        field_names = {f.name for f in self._meta.get_fields() if hasattr(f, 'attname')}
        for key, value in payload.items():
            if key in field_names and key != 'draft_fields':
                setattr(self, key, value)

        if media_links:
            from apps.media_library.models import MediaAsset

            for field_name, asset_id in media_links.items():
                if field_name not in field_names:
                    continue
                asset = MediaAsset.objects.filter(pk=asset_id).first()
                if asset:
                    setattr(self, field_name, asset.file.name)

        self.draft_fields = None
        self.published_at = timezone.now()
        self.save()
