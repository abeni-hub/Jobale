"""Project / portfolio models."""

from django.db import models
from django.utils.text import slugify

from apps.cms.base import PublishStatus, TimeStampedModel
from apps.cms.models import upload_projects, upload_project_gallery


class ProjectCategory(models.Model):
    """A project category (Building Construction, Civil Works, ...)."""

    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description = models.CharField(max_length=255, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name = 'Project category'
        verbose_name_plural = 'Project categories'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)[:130] or 'category'
            slug = base
            counter = 2
            while ProjectCategory.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class ProjectQuerySet(models.QuerySet):
    def published(self):
        return self.filter(status=PublishStatus.PUBLISHED)

    def featured(self):
        return self.filter(status=PublishStatus.PUBLISHED, is_featured=True)


class Project(TimeStampedModel):
    """A construction / civil engineering project in the portfolio."""

    class Status(models.TextChoices):
        COMPLETED = 'Completed', 'Completed'
        ONGOING = 'Ongoing', 'Ongoing'
        PLANNED = 'Planned', 'Planned'

    name = models.CharField(max_length=220)
    slug = models.SlugField(max_length=240, unique=True)
    category = models.ForeignKey(
        ProjectCategory, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='projects',
    )
    category_name = models.CharField(
        max_length=120, blank=True,
        help_text='Free-text category used when no category record is linked.',
    )
    client = models.CharField(max_length=180, blank=True)
    location = models.CharField(max_length=220, blank=True)
    overview = models.TextField(blank=True)
    summary = models.CharField(max_length=400, blank=True)
    description = models.TextField(blank=True)
    scope = models.JSONField(default=list, blank=True, help_text='List of verified scope items.')
    specifications = models.JSONField(default=list, blank=True, help_text='List of technical specifications.')
    image = models.ImageField(upload_to=upload_projects, blank=True, null=True)
    start_date = models.DateField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    project_status = models.CharField(
        max_length=32, choices=Status.choices, default=Status.COMPLETED,
    )
    is_featured = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=16, choices=PublishStatus.choices, default=PublishStatus.DRAFT,
    )
    internal_notes = models.TextField(blank=True, help_text='Internal notes — never public.')
    is_verified = models.BooleanField(default=False)

    objects = ProjectQuerySet.as_manager()

    class Meta:
        ordering = ['display_order', '-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)[:230] or 'project'
            slug = base
            counter = 2
            while Project.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{counter}'
                counter += 1
            self.slug = slug
        if not self.summary and self.overview:
            self.summary = self.overview[:400]
        super().save(*args, **kwargs)

    @property
    def resolved_category(self) -> str:
        if self.category_id and self.category:
            return self.category.name
        return self.category_name or ''


class ProjectImage(TimeStampedModel):
    """An additional gallery image for a project."""

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='gallery')
    image = models.ImageField(upload_to=upload_project_gallery)
    caption = models.CharField(max_length=255, blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']
        verbose_name = 'Project image'
        verbose_name_plural = 'Project images'

    def __str__(self):
        return self.caption or f'Project image {self.pk}'
