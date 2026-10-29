"""Public contact form endpoint with real email dispatch."""

import html
import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ContactSettings, Inquiry, get_singleton

logger = logging.getLogger(__name__)


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

    1. Validates and saves the submission into the database (Inquiry model).
    2. Sends a rich HTML & plain-text email to the company client inbox
       (default: civiljob12@gmail.com or configured ContactSettings recipient).
    3. Sets `reply_to=[inquiry.email]` so clicking Reply in the email client
       answers the customer directly.
    4. Optionally sends a confirmation receipt to the customer.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = InquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()

        # Resolve recipient email (configured in CMS or fallback setting)
        contact = get_singleton(ContactSettings)
        recipient = (
            contact.inquiry_recipient
            or contact.email
            or getattr(settings, 'INQUIRY_RECIPIENT_EMAIL', 'civiljob12@gmail.com')
        )

        from_email = (
            getattr(settings, 'DEFAULT_FROM_EMAIL', None)
            or getattr(settings, 'EMAIL_HOST_USER', None)
            or 'Jobale Engineering Website <civiljob12@gmail.com>'
        )

        emailed = False
        ref_code = f'JOB-{inquiry.pk:05d}'

        if recipient:
            # 1. Build plain text notification for client
            plain_message = (
                f"NEW WEBSITE INQUIRY — {inquiry.full_name}\n"
                f"Reference: {ref_code}\n"
                f"{'='*60}\n\n"
                f"Client / Sender Details:\n"
                f"• Full Name:     {inquiry.full_name}\n"
                f"• Organization:  {inquiry.organization or '—'}\n"
                f"• Email:         {inquiry.email}\n"
                f"• Phone:         {inquiry.phone}\n\n"
                f"Project Details:\n"
                f"• Service:       {inquiry.service_required or 'General Inquiry'}\n"
                f"• Location:      {inquiry.project_location or 'Not specified'}\n"
                f"• Budget:        {inquiry.estimated_budget or 'Not specified'}\n\n"
                f"Project Description:\n"
                f"{inquiry.project_description}\n\n"
                f"{'='*60}\n"
                f"Reply-To Note: Hit 'Reply' in your email client to respond directly to {inquiry.email}.\n"
                f"Jobale Engineering PLC • Adama, Oromia, Ethiopia\n"
            )

            # 2. Build rich HTML notification for client
            safe_name = html.escape(inquiry.full_name)
            safe_org = html.escape(inquiry.organization or '—')
            safe_email = html.escape(inquiry.email)
            safe_phone = html.escape(inquiry.phone)
            safe_service = html.escape(inquiry.service_required or 'General Inquiry')
            safe_location = html.escape(inquiry.project_location or 'Not specified')
            safe_budget = html.escape(inquiry.estimated_budget or 'Not specified')
            safe_desc = html.escape(inquiry.project_description).replace('\n', '<br>')

            html_message = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1E293B; background-color: #F8FAFC; margin: 0; padding: 20px; }}
    .container {{ max-width: 620px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }}
    .header {{ background: #07111E; padding: 28px 32px; border-bottom: 4px solid #086BB7; }}
    .header h1 {{ margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }}
    .header p {{ margin: 6px 0 0; color: #94A3B8; font-size: 13px; }}
    .badge {{ display: inline-block; background: #086BB7; color: #FFFFFF; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; font-family: monospace; margin-top: 10px; }}
    .body {{ padding: 32px; }}
    .table {{ width: 100%; border-collapse: collapse; margin-bottom: 24px; }}
    .table td {{ padding: 10px 12px; border-bottom: 1px solid #F1F5F9; font-size: 14px; }}
    .table td.label {{ width: 35%; color: #64748B; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }}
    .table td.value {{ color: #0F172A; font-weight: 500; }}
    .desc-box {{ background: #F8FAFC; border-left: 4px solid #086BB7; padding: 16px 20px; border-radius: 0 8px 8px 0; font-size: 14px; color: #334155; margin-top: 8px; }}
    .action-box {{ background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 16px; margin-top: 24px; text-align: center; }}
    .action-box a {{ display: inline-block; background: #086BB7; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 8px; }}
    .footer {{ background: #F1F5F9; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Jobale Engineering PLC</h1>
      <p>New Commercial & Project Inquiry from Website</p>
      <span class="badge">REF: {ref_code}</span>
    </div>
    <div class="body">
      <h3 style="margin-top: 0; color: #0F172A; font-size: 16px;">Client Information</h3>
      <table class="table">
        <tr><td class="label">Full Name</td><td class="value"><strong>{safe_name}</strong></td></tr>
        <tr><td class="label">Organization</td><td class="value">{safe_org}</td></tr>
        <tr><td class="label">Email Address</td><td class="value"><a href="mailto:{safe_email}" style="color: #086BB7; text-decoration: none;">{safe_email}</a></td></tr>
        <tr><td class="label">Phone Number</td><td class="value"><a href="tel:{safe_phone}" style="color: #086BB7; text-decoration: none;">{safe_phone}</a></td></tr>
      </table>

      <h3 style="margin-top: 24px; color: #0F172A; font-size: 16px;">Project Scope & Specifications</h3>
      <table class="table">
        <tr><td class="label">Service Required</td><td class="value"><strong>{safe_service}</strong></td></tr>
        <tr><td class="label">Location</td><td class="value">{safe_location}</td></tr>
        <tr><td class="label">Estimated Budget</td><td class="value">{safe_budget}</td></tr>
      </table>

      <h3 style="margin-top: 24px; color: #0F172A; font-size: 16px;">Project Description</h3>
      <div class="desc-box">
        {safe_desc}
      </div>

      <div class="action-box">
        <p style="margin: 0 0 8px; font-size: 13px; color: #1E40AF;"><strong>Quick Reply:</strong> Click below or simply reply to this email to contact the sender directly.</p>
        <a href="mailto:{safe_email}?subject=RE:%20Your%20Inquiry%20with%20Jobale%20Engineering%20PLC%20[{ref_code}]">Reply to {safe_name}</a>
      </div>
    </div>
    <div class="footer">
      Jobale Engineering PLC • Adama, Oromia, Ethiopia<br>
      Building Excellence, Delivering Trust.
    </div>
  </div>
</body>
</html>"""

            try:
                # Deliver to company inbox
                msg = EmailMultiAlternatives(
                    subject=f'New Website Inquiry: {inquiry.full_name} — {inquiry.service_required or "General Project"} [{ref_code}]',
                    body=plain_message,
                    from_email=from_email,
                    to=[recipient],
                    reply_to=[inquiry.email],
                )
                msg.attach_alternative(html_message, "text/html")
                msg.send(fail_silently=False)
                emailed = True
                logger.info(f"Successfully dispatched inquiry email for {inquiry.full_name} to {recipient} (Ref: {ref_code})")

                # Optional: Send automatic confirmation receipt to customer
                try:
                    customer_plain = (
                        f"Dear {inquiry.full_name},\n\n"
                        f"Thank you for contacting Jobale Engineering PLC.\n\n"
                        f"We have received your project inquiry regarding '{inquiry.service_required or 'Engineering Services'}' "
                        f"[Reference: {ref_code}].\n\n"
                        f"Our engineering and project management team in Adama, Ethiopia will review your details "
                        f"and contact you promptly.\n\n"
                        f"For urgent inquiries, feel free to call our office directly at +251 910 256 686.\n\n"
                        f"Best regards,\n"
                        f"Jobale Engineering PLC\n"
                        f"Building Excellence, Delivering Trust.\n"
                        f"https://jobaleengineering.com\n"
                    )
                    customer_msg = EmailMultiAlternatives(
                        subject=f'Inquiry Received: Jobale Engineering PLC [{ref_code}]',
                        body=customer_plain,
                        from_email=from_email,
                        to=[inquiry.email],
                    )
                    customer_msg.send(fail_silently=True)
                except Exception as cust_err:
                    logger.debug(f"Customer confirmation email skipped: {cust_err}")

            except Exception as exc:
                logger.exception(f"Failed to dispatch inquiry notification email for inquiry #{inquiry.pk}: {exc}")
                emailed = False

        return Response(
            {
                'detail': 'Thank you. Your inquiry has been received and our engineering team will contact you shortly.',
                'reference': ref_code,
                'email_sent': emailed,
                'recipient': recipient,
            },
            status=status.HTTP_201_CREATED,
        )
