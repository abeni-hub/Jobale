"""Authentication views: login, logout, current user, password change."""

from django.conf import settings
from django.contrib.auth import logout as django_logout
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CMSUser
from .serializers import (
    AdminUserSerializer,
    ChangePasswordSerializer,
    LoginSerializer,
    build_tokens,
)

ACCESS_COOKIE = 'jobale_access_token'
REFRESH_COOKIE = 'jobale_refresh_token'


def _set_auth_cookies(response, refresh, access, remember_me: bool):
    from datetime import timedelta

    max_age = access.get('exp') - access.get('iat')
    refresh_max_age = refresh.get('exp') - refresh.get('iat')

    secure = bool(getattr(settings, 'SESSION_COOKIE_SECURE', False))
    samesite = 'Lax'

    response.set_cookie(
        ACCESS_COOKIE,
        str(access),
        max_age=max_age,
        httponly=True,
        secure=secure,
        samesite=samesite,
        path='/',
    )
    response.set_cookie(
        REFRESH_COOKIE,
        str(refresh),
        max_age=refresh_max_age if remember_me else None,
        httponly=True,
        secure=secure,
        samesite=samesite,
        path='/api/v1/auth/',
    )
    return response


class AdminLoginView(APIView):
    """Authenticates a CMS user and issues HttpOnly auth cookies."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        remember_me = serializer.validated_data.get('remember_me', False)

        refresh, access = build_tokens(user)
        response = Response(
            {
                'user': AdminUserSerializer(user).data,
                'access_token': str(access),
                'message': 'Welcome back. You are signed in to the Jobale control center.',
            },
            status=status.HTTP_200_OK,
        )
        _set_auth_cookies(response, refresh, access, remember_me)
        # Expose a CSRF token cookie for subsequent write requests.
        response['X-CSRFToken'] = get_token(request)
        response.set_cookie('jobale_csrftoken', get_token(request), samesite='Lax', httponly=False)
        return response


class AdminLogoutView(APIView):
    """Invalidates the session and clears auth cookies."""

    permission_classes = [AllowAny]

    def post(self, request):
        django_logout(request)
        response = Response({'message': 'You have been signed out.'}, status=status.HTTP_200_OK)
        response.delete_cookie(ACCESS_COOKIE, path='/')
        response.delete_cookie(REFRESH_COOKIE, path='/api/v1/auth/')
        response.delete_cookie('jobale_csrftoken')
        return response


class CurrentUserView(APIView):
    """Returns the signed-in CMS user (used by the dashboard on boot)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not getattr(user, 'is_staff', False):
            return Response(
                {'detail': 'This account does not have access to the control center.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(
            {
                'user': AdminUserSerializer(user).data,
                'csrf_token': get_token(request),
            }
        )


class ChangePasswordView(APIView):
    """Lets a signed-in CMS user rotate their own password."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'message': 'Your password has been updated.',
                'user': AdminUserSerializer(user).data,
            }
        )
