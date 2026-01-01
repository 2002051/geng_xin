from rest_framework import viewsets, permissions
from .models import Album, Photo
from .album_utils.ser_ import AlbumSerializer, PhotoSerializer,AlbumListSerializer
from .album_utils.pagination_ import AlbumPagination
from utils.auth import LoginAuth


class AlbumViewSet(viewsets.ModelViewSet):
    authentication_classes = [LoginAuth]
    serializer_class = AlbumSerializer
    # filter_backends = []
    def get_queryset(self):
        return Album.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AlbumListViewSet(viewsets.ModelViewSet):
    authentication_classes = [LoginAuth]
    serializer_class = AlbumListSerializer
    pagination_class = AlbumPagination  # 添加分页器
    def get_queryset(self):
        print(1231223)

        return Album.objects.filter(user=self.request.user)


class PhotoViewSet(viewsets.ModelViewSet):
    authentication_classes = [LoginAuth]
    serializer_class = PhotoSerializer

    def get_queryset(self):
        return Photo.objects.filter(album__user=self.request.user)
