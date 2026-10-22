"""Authentication and permission classes used across the CMS API."""

from django.conf import settings
from rest_framework import permissions
from rest_framework.authentication import CSRFCheck
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """
    SimpleJWT authentication that also accepts an HttpOnly cookie.

    The React dashboard receives its tokens as ``HttpOnly`` cookies so that
    JavaScript (and any XSS payload) can never read them. Because cookies are
    sent automatically by the browser, unsafe HTTP methods are CSRF-protected
    exactly like Django's session authentication.
    """

    cookie_name = 'jobale_access_token'

    def authenticate(self, request):
        header = self.get_header(request)
        raw_token = None

        if header is None:
            cookie = request.COOKIES.get(self.cookie_name)
            if cookie:
                raw_token = cookie
        else:
            raw_token = self.get_raw_token(header)

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)

        # Cookie-based credentials are ambient — enforce CSRF on state changes.
        if header is None and request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            self.enforce_csrf(request)

        return (user, validated_token)

    def enforce_csrf(self, request):
        def dummy_get_response(request):  # pragma: no cover
            return None

        check = CSRFCheck(dummy_get_response)
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            raise AuthenticationFailed('CSRF Failed: %s' % reason)


class IsCMSAdmin(permissions.BasePermission):
    """Only active staff accounts (owner / editors) may manage content."""

    message = 'You do not have permission to manage website content.'

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.is_staff
        )


class IsOwner(permissions.BasePermission):
    """Owner-only operations (user management, destructive site settings)."""

    message = 'Only the account owner may perform this action.'

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_active and user.is_staff and (
            getattr(user, 'role', None) == 'owner' or user.is_superuser
        ))


class ReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        return request.method in permissions.SAFE_METHODS


def cors_origins():  # pragma: no cover - helper for diagnostics
    return settings.CORS_ALLOWED_ORIGINS
