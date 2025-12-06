from rest_framework.response import Response
from rest_framework.views import APIView
import sys
from login.log_utils import serializers_
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from back.utils.res_ import MineAPIView
from rest_framework import status


# Create your views here.HTTP_200_OK


class LoginView(APIView):
    """耿老师:登录"""
    permission_classes = [AllowAny]

    def post(self, request):
        ser = serializers_.LoginSerializer(data=request.data)
        print("#######")
        # if ser.is_valid(raise_exception=True):
        if ser.is_valid():
            print(ser.validated_data)
            username = ser.validated_data['username']
            # 生成JWT token
            refresh = RefreshToken.for_user(username)
            # 更新最后登录时间
            username.save()
            return Response({
                "code": 200,
                'message': '登录成功',
                'token': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_200_OK)
        return Response({
            "code":400,
            'message': '用户名或密码错误',
        }, status=status.HTTP_400_BAD_REQUEST)
