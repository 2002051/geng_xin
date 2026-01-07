from django.shortcuts import render
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.filters import BaseFilterBackend
from .models import LoginImage
from .ser_ import LoginImageSerializers
from utils.pagination_ import MyPagination


class LoginImageViewSet(ReadOnlyModelViewSet):
    """登录界面背景图"""
    queryset = LoginImage.objects.all()
    serializer_class = LoginImageSerializers
    pagination_class = MyPagination
    # def get_queryset(self):
