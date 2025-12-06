from django.shortcuts import render
from rest_framework.response import Response
# Create your views here.


class LoginView():
    """耿老师:登录"""
    def post(self,request):
        return Response("登录接口")