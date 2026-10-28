"""
Root URL configuration for the Jobale Engineering PLC CMS backend.

Public read APIs live under ``/api/v1/`` and management APIs under
``/api/v1/cms/``. Everything else is delegated to the individual apps.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path, re_path
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.accounts.views import (
    AdminLoginView,
    AdminLogoutView,
    CurrentUserView,
    ChangePasswordView,
)

def api_health(request):
    return JsonResponse({
        'status': 'online',
        'service': 'Jobale Engineering PLC - Backend CMS API',
        'api_version': 'v1',
        'documentation': '/api/docs/',
        'admin_panel': '/django-admin/',
        'frontend': 'https://jobaleengineering.com',
    })

api_v1 = [
    path('auth/login/', AdminLoginView.as_view(), name='auth-login'),
    path('auth/logout/', AdminLogoutView.as_view(), name='auth-logout'),
    path('auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
    path('', include('apps.cms.urls')),
]

urlpatterns = [
    path('', api_health, name='api-health'),
    path('django-admin/', admin.site.urls),
    path('api/v1/', include(api_v1)),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='schema'),
        name='swagger-ui',
    ),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]

