"""
User model for the CMS.

The default Django user model is extended (rather than replaced wholesale) so
that Django admin, SimpleJWT and the permission framework all keep working.
``role`` distinguishes the company owner from content editors.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    OWNER = 'owner', 'Owner'
    EDITOR = 'editor', 'Content Editor'
    VIEWER = 'viewer', 'Viewer'


class CMSUser(AbstractUser):
    """Staff account able to sign in to the CMS dashboard."""

    role = models.CharField(
        max_length=16,
        choices=Role.choices,
        default=Role.EDITOR,
        help_text='Owner accounts can manage users and settings.',
    )
    job_title = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=40, blank=True)

    class Meta(AbstractUser.Meta):
        db_table = 'accounts_cmsuser'

    def __str__(self):  # pragma: no cover - display helper
        return self.get_full_name() or self.username

    @property
    def can_manage_content(self) -> bool:
        """All staff accounts may edit website content."""
        return self.is_active and self.is_staff

    @property
    def is_owner(self) -> bool:
        return self.is_active and self.is_staff and (
            self.role == Role.OWNER or self.is_superuser
        )
