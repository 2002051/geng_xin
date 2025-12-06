# 耿： 序列化器
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from ..models import Guser

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    def validate(self, attrs):
        print("ytwytw")
        username = attrs.get("username")
        password = attrs.get("password")
        user = Guser.objects.filter(username=username, password=password).first() # 查询用户
        if not user:
            raise ValidationError({"code":400,"msg": "用户名或密码错误"})
        return attrs
