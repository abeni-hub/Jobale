"""
Management command to create the first CMS administrator.

Usage:
    python manage.py create_cms_admin
    python manage.py create_cms_admin --username owner --email owner@example.com

The password is never stored in the repository: if ``--password`` is omitted
the command prompts for it (and validates it with Django's password validators).
"""

import getpass
import os
import sys

from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.password_validation import validate_password
from django.db import transaction

from apps.accounts.models import CMSUser, Role


class Command(BaseCommand):
    help = 'Create (or promote) a CMS administrator account for the Jobale website control center.'

    def add_arguments(self, parser):
        parser.add_argument('--username', default=None, help='Username for the administrator.')
        parser.add_argument('--email', default=None, help='Email address for the administrator.')
        parser.add_argument('--password', default=None, help='Password (omit to be prompted securely).')
        parser.add_argument('--role', default=Role.OWNER, choices=[r.value for r in Role])
        parser.add_argument('--superuser', action='store_true', help='Also grant Django superuser rights.')

    @transaction.atomic
    def handle(self, *args, **options):
        username = options['username'] or os.environ.get('JOBALE_ADMIN_USERNAME')
        email = options['email'] or os.environ.get('JOBALE_ADMIN_EMAIL')
        password = options['password'] or os.environ.get('JOBALE_ADMIN_PASSWORD')

        if not username:
            username = input('Admin username: ').strip()
        if not username:
            raise CommandError('A username is required.')

        if not email:
            email = input('Admin email: ').strip() or None

        if not password:
            password = getpass.getpass('Admin password: ')
            confirm = getpass.getpass('Confirm password: ')
            if password != confirm:
                raise CommandError('The passwords did not match.')

        user, created = CMSUser.objects.get_or_create(
            username=username,
            defaults={
                'email': email or '',
                'role': options['role'],
                'is_staff': True,
                'is_active': True,
            },
        )

        user.email = email or user.email
        user.role = options['role']
        user.is_staff = True
        user.is_active = True
        if options['superuser']:
            user.is_superuser = True

        try:
            validate_password(password, user)
        except ValidationError as exc:
            raise CommandError('Password rejected: %s' % '; '.join(exc.messages))

        user.set_password(password)
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS('CMS administrator "%s" created.' % username))
        else:
            self.stdout.write(self.style.SUCCESS('CMS administrator "%s" updated.' % username))
        self.stdout.write('Sign in at /admin/login using this account.')
