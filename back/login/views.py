from rest_framework.response import Response
from rest_framework.views import APIView
import sys
from login.log_utils import serializers_
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from back.utils.res_ import MineAPIView
from rest_framework import status
import datetime

# Create your views here.HTTP_200_OK
from tools.jwt_ import get_jwt


class LoginView(APIView):
    """耿老师:登录"""
    permission_classes = [AllowAny]

    def post(self, request):
        ser = serializers_.LoginSerializer(data=request.data)

        # if ser.is_valid(raise_exception=True):
        if ser.is_valid():
            print(ser.validated_data)
            username = ser.validated_data['username']
            password = ser.validated_data["password"]
            payload = {
                "username": username,
                "password": password,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=60 * 24 * 7)  # 超时时间
            }
            # 生成JWT token
            token = get_jwt(payload=payload)
            return Response({
                "code": 200,
                "username":username,
                'message': '登录成功',
                'token': token
            }, status=status.HTTP_200_OK)
        return Response({
            "code": 400,
            'message': '用户名或密码错误',
        }, status=status.HTTP_400_BAD_REQUEST)
