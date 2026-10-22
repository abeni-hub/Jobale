"""Service model — one construction/engineering service offering."""

from django.db import models
from django.utils.text import slugify

from apps.cms.base import PublishStatus, TimeStampedModel
from apps.cms.models import upload_services


class ServiceQuerySet(models.QuerySet):
    def published(self):
        return self.filter(status=PublishStatus.PUBLISHED)

    def featured(self):
        return self.filter(status=PublishStatus.PUBLISHED, is_featured=True)


class Service(TimeStampedModel):
    """A service the company provides."""

    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    short_name = models.CharField(max_length=120, blank=True)
    icon = models.CharField(
        max_length=60, default='Building2',
        help_text='Approved Lucide icon name (e.g. Building2, Ruler, Wrench).',
    )
    summary = models.CharField(max_length=400)
    overview = models.TextField(blank=True)
    scope = models.JSONField(default=list, blank=True, help_text='List of scope items.')
    applications = models.JSONField(default=list, blank=True, help_text='List of typical applications.')
    approach = models.TextField(blank=True)
    quality_safety = models.TextField(blank=True)
    image = models.ImageField(upload_to=upload_services, blank=True, null=True)
    cta_label = models.CharField(max_length=80, blank=True)
    cta_url = models.CharField(max_length=255, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=16, choices=PublishStatus.choices, default=PublishStatus.DRAFT,
    )
    is_featured = models.BooleanField(default=True)
    internal_notes = models.TextField(blank=True, help_text='Internal notes — never public.')

    objects = ServiceQuerySet.as_manager()

    class Meta:
        ordering = ['display_order', 'title']
        verbose_name = 'Service'
        verbose_name_plural = 'Services'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:190] or 'service'
            slug = base
            counter = 2
            while Service.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{counter}'
                counter += 1
            self.slug = slug
        if not self.short_name:
            self.short_name = self.title
        super().save(*args, **kwargs)
