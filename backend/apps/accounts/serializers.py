"""Serializers for authentication endpoints."""

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CMSUser


def build_tokens(user: CMSUser):
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    access['role'] = user.role
    access['username'] = user.username
    return refresh, access


class AdminUserSerializer(serializers.ModelSerializer):
    """Public representation of a CMS user (never includes the password)."""

    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    is_owner = serializers.BooleanField(read_only=True)

    class Meta:
        model = CMSUser
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'role_display',
            'job_title',
            'is_owner',
            'is_staff',
            'date_joined',
            'last_login',
        )
        read_only_fields = fields

    def get_full_name(self, obj):
        name = obj.get_full_name()
        return name or obj.username


class LoginSerializer(serializers.Serializer):
    """Validates the owner/editor credentials supplied on the login page."""

    username = serializers.CharField(max_length=150, required=False)
    username_or_email = serializers.CharField(max_length=150, required=False)
    email = serializers.CharField(max_length=254, required=False)
    password = serializers.CharField(max_length=128, write_only=True, trim_whitespace=False)
    remember_me = serializers.BooleanField(default=False, required=False)

    def validate(self, attrs):
        login_ident = (
            attrs.get('username')
            or attrs.get('username_or_email')
            or attrs.get('email')
            or ''
        ).strip()
        password = attrs.get('password', '')

        if not login_ident or not password:
            raise serializers.ValidationError('Enter your email or username and password.')

        username = login_ident

        user = authenticate(
            request=self.context.get('request'),
            username=username,
            password=password,
        )

        if user is None:
            # Try the email address as the login identifier before failing.
            matched = CMSUser.objects.filter(email__iexact=username).first()
            if matched is not None:
                user = authenticate(
                    request=self.context.get('request'),
                    username=matched.get_username(),
                    password=password,
                )

        if user is None:
            raise serializers.ValidationError(
                'Those credentials were not recognised. Please check your email or '
                'username and password, then try again.'
            )

        if not user.is_active:
            raise serializers.ValidationError(
                'This account has been deactivated. Please contact the site administrator.'
            )

        if not user.is_staff:
            raise serializers.ValidationError(
                'This account does not have access to the website control center.'
            )

        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(max_length=128, write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(max_length=128, write_only=True, trim_whitespace=False)
    confirm_password = serializers.CharField(max_length=128, write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError({'current_password': 'Your current password is incorrect.'})
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'The new passwords do not match.'})
        validate_password(attrs['new_password'], user)
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user
