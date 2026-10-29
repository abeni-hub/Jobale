"""
Management command to test SMTP email dispatch for Jobale Engineering PLC.

Usage:
    python manage.py test_email
    python manage.py test_email your-email@example.com
"""

import sys
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Test the configured SMTP email backend by sending a verification email.'

    def add_arguments(self, parser):
        parser.add_argument(
            'recipient',
            nargs='?',
            default='civiljob12@gmail.com',
            help='Recipient email address (default: civiljob12@gmail.com)',
        )

    def handle(self, *args, **options):
        recipient = options['recipient']

        self.stdout.write(self.style.MIGRATE_HEADING('Jobale Engineering PLC — SMTP Email Verification'))
        self.stdout.write('=' * 60)
        self.stdout.write(f'EMAIL_BACKEND:       {settings.EMAIL_BACKEND}')
        self.stdout.write(f'EMAIL_HOST:          {settings.EMAIL_HOST or "(not set)"}')
        self.stdout.write(f'EMAIL_PORT:          {settings.EMAIL_PORT}')
        self.stdout.write(f'EMAIL_USE_TLS:       {settings.EMAIL_USE_TLS}')
        self.stdout.write(f'EMAIL_USE_SSL:       {settings.EMAIL_USE_SSL}')
        self.stdout.write(f'EMAIL_HOST_USER:     {settings.EMAIL_HOST_USER or "(not set)"}')
        pw_status = f'[Configured - {len(settings.EMAIL_HOST_PASSWORD)} chars]' if settings.EMAIL_HOST_PASSWORD else '[NOT SET / EMPTY]'
        self.stdout.write(f'EMAIL_HOST_PASSWORD: {pw_status}')
        self.stdout.write(f'DEFAULT_FROM_EMAIL:  {settings.DEFAULT_FROM_EMAIL}')
        self.stdout.write(f'TEST RECIPIENT:      {recipient}')
        self.stdout.write('=' * 60)

        if not settings.EMAIL_HOST and 'console' in settings.EMAIL_BACKEND:
            self.stdout.write(
                self.style.WARNING(
                    '\n[NOTICE] EMAIL_HOST is not configured in .env. Currently using console.EmailBackend.\n'
                    'Emails will be printed to terminal instead of dispatched over network.\n'
                    'To send real emails to your inbox, configure SMTP in backend/.env:\n'
                    '  EMAIL_HOST=smtp.gmail.com\n'
                    '  EMAIL_PORT=587\n'
                    '  EMAIL_HOST_USER=civiljob12@gmail.com\n'
                    '  EMAIL_HOST_PASSWORD=your-google-app-password\n'
                )
            )

        self.stdout.write(f'Attempting to send test email to {recipient}...')

        plain_text = (
            f"Jobale Engineering PLC — SMTP Test Message\n\n"
            f"If you received this message, your website email integration is FULLY FUNCTIONAL!\n\n"
            f"Configuration Details:\n"
            f"• Host: {settings.EMAIL_HOST}\n"
            f"• Port: {settings.EMAIL_PORT}\n"
            f"• From: {settings.DEFAULT_FROM_EMAIL}\n"
            f"• Recipient: {recipient}\n\n"
            f"All incoming customer inquiries on https://jobaleengineering.com will now "
            f"be delivered directly to this inbox.\n"
        )

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #07111E; padding: 20px; text-align: center; border-bottom: 4px solid #086BB7;">
                <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Jobale Engineering PLC</h2>
                <p style="color: #94A3B8; margin: 5px 0 0; font-size: 13px;">Automated SMTP Connection Verification</p>
            </div>
            <div style="padding: 24px; color: #1E293B;">
                <h3 style="color: #086BB7; margin-top: 0;">Email System Successfully Verified!</h3>
                <p>If you are reading this email, your website's contact form notification pipeline is working correctly.</p>
                <div style="background-color: #F8FAFC; border-left: 4px solid #086BB7; padding: 12px 16px; margin: 16px 0; font-family: monospace; font-size: 13px;">
                    <strong>Host:</strong> {settings.EMAIL_HOST}<br>
                    <strong>Port:</strong> {settings.EMAIL_PORT}<br>
                    <strong>TLS:</strong> {settings.EMAIL_USE_TLS}<br>
                    <strong>SSL:</strong> {settings.EMAIL_USE_SSL}<br>
                    <strong>From:</strong> {settings.DEFAULT_FROM_EMAIL}<br>
                </div>
                <p style="font-size: 13px; color: #64748B;">
                    Future customer inquiries submitted through the contact page will automatically land in this inbox with complete project details and one-click direct reply capability.
                </p>
            </div>
            <div style="background-color: #F1F5F9; padding: 12px; text-align: center; font-size: 12px; color: #64748B;">
                Jobale Engineering PLC • Adama, Oromia, Ethiopia
            </div>
        </div>
        """

        try:
            msg = EmailMultiAlternatives(
                subject='[Jobale Engineering] SMTP Test Email — System Operational',
                body=plain_text,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient],
            )
            msg.attach_alternative(html_content, 'text/html')
            msg.send(fail_silently=False)

            self.stdout.write(
                self.style.SUCCESS(f'\nSUCCESS: Test email successfully sent to {recipient}!')
            )
        except Exception as exc:
            self.stdout.write(self.style.ERROR(f'\nERROR: Failed to send test email: {exc}\n'))
            self.stdout.write('Troubleshooting Tips:')
            self.stdout.write('1. If using Gmail (smtp.gmail.com):')
            self.stdout.write('   - Regular Gmail passwords DO NOT work. Google requires an "App Password".')
            self.stdout.write('   - Go to myaccount.google.com -> Security -> 2-Step Verification -> App Passwords.')
            self.stdout.write('   - Generate a 16-character App Password and paste it into EMAIL_HOST_PASSWORD.')
            self.stdout.write('2. If using cPanel Webmail (e.g. mail.jobaleengineering.com):')
            self.stdout.write('   - Set EMAIL_PORT=465 and EMAIL_USE_SSL=True (or 587 with TLS).')
            self.stdout.write('   - Set EMAIL_HOST_USER to your full email address (e.g. contact@jobaleengineering.com).')
            self.stdout.write('3. Check server firewall:')
            self.stdout.write('   - Some shared hosting providers block outbound port 25/587 by default.')
            sys.exit(1)

