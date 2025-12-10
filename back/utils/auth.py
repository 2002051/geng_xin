# 认证组件
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import jwt

from login import models


class LoginAuth(BaseAuthentication):

    def authenticate(self, request):
        if request.method == "OPTIONS":
            # 预检不进行权限校验
            return
        jwt_token = request.headers.get("token")
        verified_payload = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms="HS256")
        exp = verified_payload.pop("exp")
        user = models.Guser.objects.filter(**verified_payload).first()
        if user:
            return user,jwt_token

        raise AuthenticationFailed("请先登录")

    def authenticate_header(self, request):
        return "API"
