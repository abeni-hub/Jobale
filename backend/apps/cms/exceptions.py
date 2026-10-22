"""Consistent API error responses."""

from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def api_exception_handler(exc, context):
    """Wraps DRF's default handler with a consistent JSON envelope."""
    response = drf_exception_handler(exc, context)

    if response is None:
        if isinstance(exc, DjangoValidationError):
            return Response(
                {'detail': 'The submitted data is invalid.', 'errors': exc.message_dict
                 if hasattr(exc, 'message_dict') else {'non_field_errors': exc.messages}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return None

    detail = response.data
    errors = None
    message = 'The request could not be completed.'

    if isinstance(detail, dict):
        if 'detail' in detail:
            message = str(detail['detail'])
            errors = {k: v for k, v in detail.items() if k != 'detail'}
        else:
            errors = detail
            first = next(iter(detail.values()), None)
            if isinstance(first, (list, tuple)) and first:
                message = str(first[0])
            elif first:
                message = str(first)
    elif isinstance(detail, list):
        errors = {'non_field_errors': detail}
        if detail:
            message = str(detail[0])

    payload = {'detail': message}
    if errors:
        payload['errors'] = errors
    response.data = payload
    return response
