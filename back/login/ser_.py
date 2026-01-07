# 耿： 序列化器
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from login.models import Guser

class LoginSerializer(serializers.Serializer):
    # id = serializers.IntegerField()
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


from django.core.cache import cache


class UserProfileSerializer(serializers.ModelSerializer):

    @staticmethod
    def get_cached_profile(user_id):
        """获取缓存的用户资料"""
        cache_key = f'user_profile_{user_id}'
        profile = cache.get(cache_key)
        if not profile:
            user = Guser.objects.get(id=user_id)
            serializer = UserProfileSerializer(user)
            profile = serializer.data
            cache.set(cache_key, profile, timeout=300)  # 缓存5分钟
        return profile

class GUserSerializer(serializers.ModelSerializer):
    """用于更新用户资料的序列化器"""

    class Meta:
        model = Guser
        fields = ['id','username', 'gender', 'signature', 'avatar','created_at']

    def validate_signature(self, value):
        """验证个性签名"""
        if len(value) > 200:
            raise serializers.ValidationError("个性签名不能超过200字")
        # 过滤敏感词等
        return value