from django.contrib import admin

from apps.projects.models import Project, ProjectCategory, ProjectImage
from apps.services.models import Service

from .models import (
    AboutBlock,
    AboutContent,
    ClientReference,
    ContactSettings,
    ContentActivity,
    FooterSettings,
    HeroContent,
    Inquiry,
    NavigationItem,
    PageSection,
    QualitySafetyContent,
    QualityStandard,
    SEOSettings,
    SiteSettings,
    Testimonial,
)


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'slogan', 'updated_at')
    fieldsets = (
        ('Identity', {'fields': ('company_name', 'legal_name', 'slogan', 'logo', 'logo_dark',
                                  'favicon')}),
        ('Brand', {'fields': ('brand_primary', 'brand_navy', 'brand_accent')}),
        ('Metadata', {'fields': ('default_page_title', 'default_meta_description', 'website_url')}),
        ('Social', {'fields': ('social_facebook', 'social_linkedin', 'social_twitter',
                               'social_instagram', 'social_youtube')}),
        ('Footer', {'fields': ('footer_copyright',)}),
    )


@admin.register(HeroContent)
class HeroContentAdmin(admin.ModelAdmin):
    list_display = ('headline', 'headline_accent', 'overlay_opacity', 'show_blueprint')


@admin.register(AboutContent)
class AboutContentAdmin(admin.ModelAdmin):
    list_display = ('heading', 'updated_at')


@admin.register(AboutBlock)
class AboutBlockAdmin(admin.ModelAdmin):
    list_display = ('title', 'display_order', 'is_visible')
    list_editable = ('display_order', 'is_visible')


@admin.register(QualitySafetyContent)
class QualitySafetyContentAdmin(admin.ModelAdmin):
    list_display = ('heading', 'display_order')


@admin.register(QualityStandard)
class QualityStandardAdmin(admin.ModelAdmin):
    list_display = ('name', 'issuing_body', 'status', 'is_public', 'display_order')
    list_filter = ('status', 'is_public')


@admin.register(ClientReference)
class ClientReferenceAdmin(admin.ModelAdmin):
    list_display = ('name', 'association', 'status', 'show_logo', 'display_order')
    list_filter = ('status',)


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'status', 'is_verified', 'display_order')
    list_filter = ('status', 'is_verified')


@admin.register(ContactSettings)
class ContactSettingsAdmin(admin.ModelAdmin):
    list_display = ('heading', 'phone', 'email', 'city')


@admin.register(NavigationItem)
class NavigationItemAdmin(admin.ModelAdmin):
    list_display = ('label', 'url', 'display_order', 'is_visible', 'status')
    list_editable = ('display_order', 'is_visible')


@admin.register(FooterSettings)
class FooterSettingsAdmin(admin.ModelAdmin):
    list_display = ('description', 'copyright_text')


@admin.register(SEOSettings)
class SEOSettingsAdmin(admin.ModelAdmin):
    list_display = ('page_title', 'social_title')


@admin.register(PageSection)
class PageSectionAdmin(admin.ModelAdmin):
    list_display = ('label', 'key', 'display_order', 'is_enabled')
    list_editable = ('display_order', 'is_enabled')


@admin.register(ContentActivity)
class ContentActivityAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'action', 'section', 'summary', 'actor')
    list_filter = ('action', 'section')
    readonly_fields = ('created_at', 'action', 'section', 'summary', 'actor')


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'full_name', 'organization', 'service_required', 'status')
    list_filter = ('status', 'service_required')
    search_fields = ('full_name', 'email', 'organization', 'project_description')


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'status', 'display_order', 'is_featured')
    list_filter = ('status', 'is_featured')
    search_fields = ('title', 'summary')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'display_order', 'is_active')
    prepopulated_fields = {'slug': ('name',)}


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 0
    fields = ('image', 'caption', 'alt_text', 'display_order')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'category', 'location', 'status', 'is_featured',
                    'display_order')
    list_filter = ('status', 'is_featured', 'category')
    search_fields = ('name', 'location', 'client', 'summary')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProjectImageInline]
