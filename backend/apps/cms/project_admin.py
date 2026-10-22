from django.contrib import admin

from apps.projects.models import Project, ProjectCategory, ProjectImage
from apps.services.models import Service


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
