"""Signals that keep the media library in sync with content image fields."""

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import MediaAsset


@receiver(post_save)
def register_uploaded_images(sender, instance, **kwargs):
    """
    Automatically create a media-library entry for every image stored on a
    content model so uploads can be reused later from the Media Library.
    """
    if sender is MediaAsset:
        return

    meta = getattr(instance, '_meta', None)
    if meta is None or meta.app_label not in ('cms', 'services', 'projects'):
        return

    for field in meta.fields:
        if field.get_internal_type() != 'ImageField':
            continue
        file_value = getattr(instance, field.name, None)
        name = getattr(file_value, 'name', '') if file_value else ''
        if not name:
            continue
        asset = MediaAsset.objects.filter(file=name).first()
        if asset:
            continue
        actor = getattr(instance, 'uploaded_by', None)
        if actor is None:
            actor = getattr(instance, 'updated_by', None) or getattr(instance, 'created_by', None)
        MediaAsset.objects.create(
            file=name,
            title=name.split('/')[-1][:180],
            alt_text='',
            kind=MediaAsset.Kind.IMAGE,
            size_bytes=getattr(file_value, 'size', 0) or 0,
            uploaded_by=actor if isinstance(actor, type(instance)) else None,
        )
