from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import UpdateModelMixin, RetrieveModelMixin,ListModelMixin
from .models import Guser
from login.ser_ import LoginSerializer,GUserSerializer
from rest_framework.permissions import AllowAny
from rest_framework import status
import datetime
from utils.auth import LoginAuth
# Create your views here.HTTP_200_OK
from tools.jwt_ import get_jwt


class LoginView(APIView):
    """耿老师:登录"""
    permission_classes = [AllowAny]

    def post(self, request):
        ser = LoginSerializer(data=request.data)

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
                "id":Guser.objects.get(username=username).id,
                "username": username,
                'message': '登录成功',
                'token': token
            }, status=status.HTTP_200_OK)
        return Response({
            "code": 400,
            'message': '用户名或密码错误',
        }, status=status.HTTP_200_OK)


class GuserViewSet(ListModelMixin,RetrieveModelMixin,UpdateModelMixin,GenericViewSet):
    queryset = Guser.objects
    authentication_classes = [LoginAuth]
    serializer_class = GUserSerializer
    # def get_queryset(self):
