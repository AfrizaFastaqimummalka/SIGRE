import logging
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import Users

logger = logging.getLogger(__name__)

class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that overrides get_user to lookup 
    from our custom 'Users' model instead of the standard Django Auth User model.
    """
    def get_user(self, validated_token):
        # We assume the user ID claim is stored under 'user_id' by default
        # or whatever the simplejwt settings say.
        try:
            from rest_framework_simplejwt.settings import api_settings
            user_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError:
            raise AuthenticationFailed('Token contained no recognizable user identification', code='token_not_valid')

        try:
            user = Users.objects.get(id=user_id)
        except Users.DoesNotExist:
            raise AuthenticationFailed('User not found', code='user_not_found')

        if not user.is_active:
            raise AuthenticationFailed('User is inactive or deleted', code='user_inactive')

        # DRF's IsAuthenticated permission specifically checks if `request.user.is_authenticated` is True.
        # Since our custom model does not inherit from AbstractBaseUser, we can monkey-patch it
        # for the current request lifecycle so it passes the permission check.
        user.is_authenticated = True

        return user

