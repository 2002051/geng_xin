from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import LoginImage

class LoginImageSerializers(serializers.ModelSerializer):

    class Meta:
        model = LoginImage
        fields = ['id', 'image', 'created_at']
        read_only_fields = ['created_at', 'updated_at', 'user']
