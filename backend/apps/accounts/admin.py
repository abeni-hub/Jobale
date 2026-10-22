from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CMSUser


@admin.register(CMSUser)
class CMSUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('CMS profile', {'fields': ('role', 'job_title', 'phone')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('CMS profile', {'fields': ('role', 'email', 'job_title', 'phone')}),
    )
