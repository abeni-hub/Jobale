"""Public contact form endpoint."""

from django.core.mail import send_mail
from django.conf import settings
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ContactSettings, Inquiry, get_singleton


class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = (
            'full_name', 'organization', 'email', 'phone', 'service_required',
            'project_location', 'estimated_budget', 'project_description', 'consent',
        )

    def validate_full_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Please enter your full name.')
        return value

    def validate_email(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Please enter your email address.')
        return value

    def validate_phone(self, value):
        value = value.strip()
        if len(value) < 6:
            raise serializers.ValidationError('Please enter a valid phone number.')
        return value

    def validate_project_description(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError('Please describe your project in a little more detail.')
        return value

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError('Please accept the privacy notice to continue.')
        return value


class ContactInquiryView(APIView):
    """
    Accepts a project inquiry from the public website.

    The submission is stored in the database. An email is only sent when the
    server is configured with working SMTP credentials — the response never
    claims an email was sent unless it actually was.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = InquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()

        contact = get_singleton(ContactSettings)
        recipient = contact.inquiry_recipient or contact.email
        emailed = False

        if recipient:
            try:
                send_mail(
                    subject=f'New website inquiry — {inquiry.full_name}',
                    message=(
                        f'Full name: {inquiry.full_name}\n'
                        f'Organization: {inquiry.organization or "—"}\n'
                        f'Email: {inquiry.email}\n'
                        f'Phone: {inquiry.phone}\n'
                        f'Service: {inquiry.service_required or "—"}\n'
                        f'Location: {inquiry.project_location or "—"}\n'
                        f'Budget: {inquiry.estimated_budget or "—"}\n\n'
                        f'{inquiry.project_description}\n'
                    ),
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None) or recipient,
                    recipient_list=[recipient],
                    fail_silently=False,
                )
                emailed = True
            except Exception:
                # The inquiry is safely stored even if email delivery fails.
                emailed = False

        return Response(
            {
                'detail': 'Thank you. Your inquiry has been received and our team will '
                          'contact you shortly.',
                'reference': f'JOB-{inquiry.pk:05d}',
                'email_sent': emailed,
            },
            status=status.HTTP_201_CREATED,
        )
