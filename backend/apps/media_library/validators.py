"""Upload validators for the media library."""

import os

from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible

ALLOWED_IMAGE_EXTENSIONS = tuple(settings.ALLOWED_IMAGE_EXTENSIONS)
ALLOWED_DOCUMENT_EXTENSIONS = tuple(settings.ALLOWED_DOCUMENT_EXTENSIONS)

# Never allow these to be uploaded regardless of extension checks.
BLOCKED_EXTENSIONS = {
    'exe', 'bat', 'cmd', 'com', 'scr', 'pif', 'msi', 'dll', 'jar', 'ps1',
    'vbs', 'sh', 'cgi', 'php', 'phtml', 'html', 'htm', 'js', 'svgz',
}


@deconstructible
class MaxFileSizeValidator:
    """Rejects files larger than ``settings.MAX_UPLOAD_SIZE_MB``."""

    def __init__(self, max_mb=None):
        self.max_mb = max_mb or settings.MAX_UPLOAD_SIZE_MB

    def __call__(self, value):
        size = getattr(value, 'size', None)
        if size is None:
            return
        max_bytes = self.max_mb * 1024 * 1024
        if size > max_bytes:
            raise ValidationError(
                'File is too large (maximum %(limit)s MB).',
                code='too_large',
                params={'limit': self.max_mb},
            )

    def __eq__(self, other):
        return isinstance(other, MaxFileSizeValidator) and other.max_mb == self.max_mb


def extension_of(name: str) -> str:
    return os.path.splitext(name or '')[1].lstrip('.').lower()


@deconstructible
class SafeFileExtensionValidator:
    """Allows only known-safe image/document extensions."""

    allowed = ALLOWED_IMAGE_EXTENSIONS + ALLOWED_DOCUMENT_EXTENSIONS

    def __call__(self, value):
        name = getattr(value, 'name', '') or ''
        ext = extension_of(name)
        if not ext:
            raise ValidationError('The uploaded file has no extension.', code='no_extension')
        if ext in BLOCKED_EXTENSIONS:
            raise ValidationError(
                'Files of type "%(ext)s" are not permitted.',
                code='blocked_extension',
                params={'ext': ext},
            )
        if ext not in self.allowed:
            raise ValidationError(
                'Unsupported file type "%(ext)s". Allowed types: %(allowed)s.',
                code='invalid_extension',
                params={'ext': ext, 'allowed': ', '.join(sorted(self.allowed))},
            )


def validate_image_content(file_obj):
    """Confirms an uploaded file is a genuine, decodable image."""
    from PIL import Image

    try:
        file_obj.seek(0)
        with Image.open(file_obj) as img:
            img.verify()
        file_obj.seek(0)
    except Exception:
        raise ValidationError(
            'The uploaded file is not a valid image.', code='invalid_image'
        )
