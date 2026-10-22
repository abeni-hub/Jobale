"""
Content models for the Jobale Engineering PLC website.

Design notes
------------
* Canonical single-instance sections (``SiteSettings``, ``HeroContent``,
  ``AboutContent``, ``QualitySafetyContent``, ``ContactSettings``,
  ``FooterSettings``, ``SEOSettings``) are enforced as singletons through
  :func:`get_singleton` / ``save()`` overrides, so updating them never
  creates duplicate records.
* Collection content (services, projects, clients, testimonials, navigation
  items, quality standards) uses a per-record publish status.
* Long-form structured copy is stored as JSON lists of plain strings so that
  no raw HTML or JavaScript can be injected by content editors.
"""

from django.conf import settings
from django.db import models

from .base import DraftableMixin, PublishStatus, TimeStampedModel


def _build_upload_path(section, instance, filename):
    import os
    import uuid

    from django.utils import timezone

    ext = os.path.splitext(filename)[1].lower() or '.bin'
    base = os.path.splitext(os.path.basename(filename))[0]
    safe = ''.join(ch for ch in base if ch.isalnum() or ch in ('-', '_'))[:50] or 'image'
    stamp = timezone.now().strftime('%Y/%m')
    return f'{section}/{stamp}/{safe}-{uuid.uuid4().hex[:8]}{ext}'


def upload_site(instance, filename):
    return _build_upload_path('site', instance, filename)


def upload_hero(instance, filename):
    return _build_upload_path('hero', instance, filename)


def upload_about(instance, filename):
    return _build_upload_path('about', instance, filename)


def upload_quality(instance, filename):
    return _build_upload_path('quality', instance, filename)


def upload_clients(instance, filename):
    return _build_upload_path('clients', instance, filename)


def upload_testimonials(instance, filename):
    return _build_upload_path('testimonials', instance, filename)


def upload_seo(instance, filename):
    return _build_upload_path('seo', instance, filename)


def upload_services(instance, filename):
    return _build_upload_path('services', instance, filename)


def upload_projects(instance, filename):
    return _build_upload_path('projects', instance, filename)


def upload_project_gallery(instance, filename):
    return _build_upload_path('projects/gallery', instance, filename)


def get_singleton(model):
    """Return (and lazily create) the canonical record for a singleton model."""
    obj = model.objects.first()
    if obj is None:
        obj = model.objects.create()
    return obj


class ContentActivity(models.Model):
    """Audit trail of content changes shown on the dashboard overview."""

    class Action(models.TextChoices):
        CREATED = 'created', 'Created'
        UPDATED = 'updated', 'Updated'
        PUBLISHED = 'published', 'Published'
        UNPUBLISHED = 'unpublished', 'Unpublished'
        DELETED = 'deleted', 'Deleted'
        DRAFT = 'draft', 'Draft saved'
        UPLOAD = 'upload', 'Media uploaded'

    action = models.CharField(max_length=16, choices=Action.choices, default=Action.UPDATED)
    section = models.CharField(max_length=120)
    summary = models.CharField(max_length=255)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='content_activity',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Content activity'
        verbose_name_plural = 'Content activity'

    def __str__(self):
        return f'{self.section}: {self.summary}'


# ---------------------------------------------------------------------------
# Global website settings
# ---------------------------------------------------------------------------
class SiteSettings(DraftableMixin, TimeStampedModel):
    """Global, single-instance website settings."""

    company_name = models.CharField(max_length=180, default='Jobale Engineering PLC')
    legal_name = models.CharField(max_length=180, default='Jobale Engineering PLC')
    slogan = models.CharField(max_length=255, default='Building Excellence, Delivering Trust.')
    logo = models.ImageField(upload_to=upload_site, blank=True, null=True)
    logo_dark = models.ImageField(
        upload_to=upload_site, blank=True, null=True,
        help_text='Optional alternate logo used on dark backgrounds.',
    )
    favicon = models.ImageField(upload_to=upload_site, blank=True, null=True)
    brand_primary = models.CharField(max_length=7, default='#086BB7')
    brand_navy = models.CharField(max_length=7, default='#07111E')
    brand_accent = models.CharField(max_length=7, default='#2A8AE0')
    default_page_title = models.CharField(
        max_length=180,
        default='Jobale Engineering PLC | Construction & Civil Engineering in Adama, Ethiopia',
    )
    default_meta_description = models.CharField(
        max_length=320,
        default=(
            'General construction and civil engineering company in Adama, Ethiopia. '
            'Building construction, civil infrastructure, water supply, renovation, '
            'and maintenance services.'
        ),
    )
    social_facebook = models.URLField(blank=True)
    social_linkedin = models.URLField(blank=True)
    social_twitter = models.URLField(blank=True)
    social_instagram = models.URLField(blank=True)
    social_youtube = models.URLField(blank=True)
    footer_copyright = models.CharField(
        max_length=255,
        default='© {year} Jobale Engineering PLC. All rights reserved.',
    )
    website_url = models.URLField(blank=True)

    class Meta:
        verbose_name = 'Site settings'
        verbose_name_plural = 'Site settings'

    def __str__(self):
        return self.company_name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# Hero
# ---------------------------------------------------------------------------
class HeroContent(DraftableMixin, TimeStampedModel):
    """Homepage hero section content."""

    class ImagePosition(models.TextChoices):
        CENTER = 'center', 'Center'
        TOP = 'top', 'Top'
        BOTTOM = 'bottom', 'Bottom'
        LEFT = 'left', 'Left'
        RIGHT = 'right', 'Right'

    eyebrow = models.CharField(
        max_length=180,
        default='JOBALE ENGINEERING PLC | CONSTRUCTION & CIVIL WORKS',
    )
    headline = models.CharField(max_length=180, default='Building with Precision.')
    headline_accent = models.CharField(max_length=180, default='Delivering with Confidence.')
    supporting_text = models.CharField(
        max_length=600,
        default=(
            'From building construction to civil infrastructure, Jobale Engineering delivers '
            'practical engineering solutions grounded in quality, safety, reliability, and '
            'lasting value.'
        ),
    )
    primary_cta_label = models.CharField(max_length=80, default='Explore Our Projects')
    primary_cta_url = models.CharField(max_length=255, default='/projects')
    secondary_cta_label = models.CharField(max_length=80, default='Discuss Your Project')
    secondary_cta_url = models.CharField(max_length=255, default='/contact')
    hero_image = models.ImageField(upload_to=upload_hero, blank=True, null=True)
    background_image = models.ImageField(upload_to=upload_hero, blank=True, null=True)
    overlay_opacity = models.PositiveSmallIntegerField(
        default=78,
        help_text='Dark overlay strength over the hero background (0-100).',
    )
    show_blueprint = models.BooleanField(
        default=True,
        help_text='Show the animated blueprint city illustration behind the hero.',
    )
    image_position = models.CharField(
        max_length=16, choices=ImagePosition.choices, default=ImagePosition.CENTER,
    )
    focal_x = models.PositiveSmallIntegerField(default=50, help_text='Focal point X (0-100).')
    focal_y = models.PositiveSmallIntegerField(default=50, help_text='Focal point Y (0-100).')
    caption = models.CharField(max_length=255, blank=True)
    slogan = models.CharField(max_length=255, default='Building Excellence, Delivering Trust.')

    class Meta:
        verbose_name = 'Hero content'
        verbose_name_plural = 'Hero content'

    def __str__(self):
        return 'Homepage hero'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# About
# ---------------------------------------------------------------------------
class AboutContent(DraftableMixin, TimeStampedModel):
    """About Us section content."""

    heading = models.CharField(max_length=180, default='Engineering Solutions Built Around Your Vision')
    introduction = models.TextField(
        default=(
            'Jobale Engineering PLC is a professionally managed general construction company '
            'engaged in building construction, civil works, renovation, maintenance, and '
            'related engineering services.'
        ),
    )
    overview = models.TextField(blank=True)
    mission = models.TextField(blank=True)
    vision = models.TextField(blank=True)
    core_values = models.JSONField(default=list, blank=True)
    history = models.TextField(blank=True)
    main_image = models.ImageField(upload_to=upload_about, blank=True, null=True)
    secondary_image = models.ImageField(upload_to=upload_about, blank=True, null=True)
    stats = models.JSONField(default=list, blank=True)
    eyebrow = models.CharField(max_length=180, default='Who We Are')

    class Meta:
        verbose_name = 'About content'
        verbose_name_plural = 'About content'

    def __str__(self):
        return 'About us'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


class AboutBlock(TimeStampedModel):
    """Ordered content block inside the About section."""

    title = models.CharField(max_length=180)
    body = models.TextField(blank=True)
    icon = models.CharField(
        max_length=60, blank=True,
        help_text='Approved Lucide icon name, e.g. "ShieldCheck".',
    )
    image = models.ImageField(upload_to=upload_about, blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'id']
        verbose_name = 'About block'
        verbose_name_plural = 'About blocks'

    def __str__(self):
        return self.title


# ---------------------------------------------------------------------------
# Quality & safety
# ---------------------------------------------------------------------------
class QualitySafetyContent(DraftableMixin, TimeStampedModel):
    """Quality & Safety section content."""

    heading = models.CharField(max_length=180, default='Quality, Safety & Sustainability')
    introduction = models.TextField(blank=True)
    quality_assurance = models.TextField(blank=True)
    safety_practices = models.TextField(blank=True)
    environmental_practices = models.TextField(blank=True)
    commitments = models.JSONField(default=list, blank=True)
    hero_image = models.ImageField(upload_to=upload_quality, blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Quality & safety content'
        verbose_name_plural = 'Quality & safety content'

    def __str__(self):
        return 'Quality & safety'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


class QualityStandard(TimeStampedModel):
    """A verified certification / credential / standard."""

    name = models.CharField(max_length=180)
    issuing_body = models.CharField(max_length=180, blank=True)
    certificate_number = models.CharField(max_length=120, blank=True)
    valid_from = models.DateField(null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)
    category = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    document = models.FileField(upload_to=upload_quality, blank=True, null=True)
    image = models.ImageField(upload_to=upload_quality, blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=16, choices=PublishStatus.choices, default=PublishStatus.DRAFT,
    )
    internal_notes = models.TextField(
        blank=True, help_text='Internal verification notes — never shown publicly.',
    )
    is_public = models.BooleanField(
        default=False, help_text='Show this credential on the public website.',
    )

    class Meta:
        ordering = ['display_order', 'id']
        verbose_name = 'Quality standard'
        verbose_name_plural = 'Quality standards'

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# Clients & references
# ---------------------------------------------------------------------------
class ClientReference(TimeStampedModel):
    """A client organisation the company has worked with."""

    name = models.CharField(max_length=180)
    logo = models.ImageField(upload_to=upload_clients, blank=True, null=True)
    project = models.ForeignKey(
        'projects.Project', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='client_references',
    )
    association = models.CharField(
        max_length=255, blank=True,
        help_text='Which project or engagement this reference relates to.',
    )
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=16, choices=PublishStatus.choices, default=PublishStatus.DRAFT,
    )
    internal_notes = models.TextField(
        blank=True,
        help_text='Permission / verification notes for internal use only.',
    )
    show_logo = models.BooleanField(
        default=False, help_text='Display the organisation logo publicly.',
    )

    class Meta:
        ordering = ['display_order', 'id']
        verbose_name = 'Client reference'
        verbose_name_plural = 'Client references'

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# Testimonials
# ---------------------------------------------------------------------------
class Testimonial(TimeStampedModel):
    """A client testimonial (only published once verified and approved)."""

    name = models.CharField(max_length=180)
    job_title = models.CharField(max_length=180, blank=True)
    organization = models.CharField(max_length=180, blank=True)
    quote = models.TextField()
    image = models.ImageField(upload_to=upload_testimonials, blank=True, null=True)
    project = models.ForeignKey(
        'projects.Project', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='testimonials',
    )
    display_order = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=16, choices=PublishStatus.choices, default=PublishStatus.DRAFT,
    )
    internal_notes = models.TextField(
        blank=True, help_text='Verification / permission notes for internal use only.',
    )
    is_verified = models.BooleanField(default=False)

    class Meta:
        ordering = ['display_order', 'id']
        verbose_name = 'Testimonial'
        verbose_name_plural = 'Testimonials'

    def __str__(self):
        return f'{self.name} — {self.organization or "Client"}'


# ---------------------------------------------------------------------------
# Contact
# ---------------------------------------------------------------------------
class ContactSettings(DraftableMixin, TimeStampedModel):
    """Contact section + office details."""

    heading = models.CharField(max_length=180, default='Contact Our Team')
    description = models.TextField(blank=True)
    office_address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=120, default='Adama')
    region = models.CharField(max_length=120, default='Oromia')
    country = models.CharField(max_length=120, default='Ethiopia')
    phone = models.CharField(max_length=60, blank=True)
    secondary_phone = models.CharField(max_length=60, blank=True)
    email = models.EmailField(blank=True)
    secondary_email = models.EmailField(blank=True)
    business_hours = models.CharField(max_length=255, blank=True)
    map_url = models.URLField(blank=True)
    map_embed_url = models.URLField(blank=True)
    inquiry_recipient = models.EmailField(
        blank=True,
        help_text='Where contact form submissions are delivered (SMTP destination).',
    )
    form_note = models.CharField(max_length=320, blank=True)
    social_facebook = models.URLField(blank=True)
    social_linkedin = models.URLField(blank=True)
    social_twitter = models.URLField(blank=True)
    social_instagram = models.URLField(blank=True)
    social_youtube = models.URLField(blank=True)

    class Meta:
        verbose_name = 'Contact settings'
        verbose_name_plural = 'Contact settings'

    def __str__(self):
        return 'Contact settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# Navigation & footer
# ---------------------------------------------------------------------------
class NavigationItem(TimeStampedModel):
    """A header navigation entry."""

    label = models.CharField(max_length=80)
    url = models.CharField(
        max_length=255, default='/',
        help_text='Internal path (e.g. /services) or a full https:// URL.',
    )
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    is_external = models.BooleanField(default=False)
    open_in_new_tab = models.BooleanField(default=False)
    status = models.CharField(
        max_length=16, choices=PublishStatus.choices, default=PublishStatus.PUBLISHED,
    )

    class Meta:
        ordering = ['display_order', 'id']
        verbose_name = 'Navigation item'
        verbose_name_plural = 'Navigation items'

    def __str__(self):
        return self.label


class FooterSettings(DraftableMixin, TimeStampedModel):
    """Footer content."""

    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to=upload_site, blank=True, null=True)
    columns = models.JSONField(
        default=list, blank=True,
        help_text='Footer link groups: [{"heading": "...", "links": [{"label": "...", "url": "..."}]}]',
    )
    contact_details = models.JSONField(default=list, blank=True)
    social_links = models.JSONField(default=list, blank=True)
    copyright_text = models.CharField(max_length=255, blank=True)
    legal_links = models.JSONField(default=list, blank=True)
    show_replay_intro = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Footer settings'
        verbose_name_plural = 'Footer settings'

    def __str__(self):
        return 'Footer settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# SEO
# ---------------------------------------------------------------------------
class SEOSettings(DraftableMixin, TimeStampedModel):
    """Default page metadata and social sharing information."""

    page_title = models.CharField(
        max_length=180,
        default='Jobale Engineering PLC | Construction & Civil Engineering in Adama, Ethiopia',
    )
    meta_description = models.CharField(
        max_length=320,
        default=(
            'General construction and civil engineering company in Adama, Ethiopia. '
            'Building construction, civil infrastructure, water supply, renovation, '
            'and maintenance services.'
        ),
    )
    og_image = models.ImageField(upload_to=upload_seo, blank=True, null=True)
    social_title = models.CharField(max_length=180, blank=True)
    social_description = models.CharField(max_length=320, blank=True)
    twitter_handle = models.CharField(max_length=60, blank=True)
    keywords = models.CharField(max_length=320, blank=True)
    canonical_url = models.URLField(blank=True)

    class Meta:
        verbose_name = 'SEO settings'
        verbose_name_plural = 'SEO settings'

    def __str__(self):
        return 'SEO settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# Page sections registry (drives the "Website Sections" dashboard nav)
# ---------------------------------------------------------------------------
class PageSection(TimeStampedModel):
    """Registry entry describing a managed section of the public website."""

    key = models.SlugField(max_length=80, unique=True)
    label = models.CharField(max_length=120)
    description = models.CharField(max_length=255, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_enabled = models.BooleanField(default=True)
    icon = models.CharField(max_length=60, blank=True)

    class Meta:
        ordering = ['display_order', 'label']
        verbose_name = 'Website section'
        verbose_name_plural = 'Website sections'

    def __str__(self):
        return self.label


# ---------------------------------------------------------------------------
# Contact inquiries
# ---------------------------------------------------------------------------
class Inquiry(TimeStampedModel):
    """A submission from the public contact form."""

    class Status(models.TextChoices):
        NEW = 'new', 'New'
        IN_PROGRESS = 'in_progress', 'In progress'
        CLOSED = 'closed', 'Closed'

    full_name = models.CharField(max_length=180)
    organization = models.CharField(max_length=180, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=60)
    service_required = models.CharField(max_length=180, blank=True)
    project_location = models.CharField(max_length=180, blank=True)
    estimated_budget = models.CharField(max_length=120, blank=True)
    project_description = models.TextField()
    consent = models.BooleanField(default=False)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.NEW)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Inquiry'
        verbose_name_plural = 'Inquiries'

    def __str__(self):
        return f'{self.full_name} — {self.service_required or "General"}'
