from rest_framework import viewsets,status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db.models import Max
from .models import Album, Photo
from album.ser_ import AlbumSerializer, PhotoSerializer,AlbumListSerializer,PhotoUploadSerializer
from .album_utils.pagination_ import AlbumPagination
from utils.auth import LoginAuth
from django.shortcuts import get_object_or_404

class AlbumViewSet(viewsets.ModelViewSet):
    authentication_classes = [LoginAuth]
    serializer_class = AlbumSerializer
    # filter_backends = []
    def get_queryset(self):
        return Album.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AlbumListViewSet(viewsets.ModelViewSet):
    queryset = Album.objects
    authentication_classes = [LoginAuth]
    serializer_class = AlbumListSerializer
    pagination_class = AlbumPagination  # 添加分页器
    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)



class PhotoViewSet(viewsets.ModelViewSet):
    authentication_classes = [LoginAuth]
    serializer_class = PhotoSerializer

    def get_queryset(self):
        return Photo.objects.filter(album__user=self.request.user)


# class PhotoUploadView(APIView):
#     """上传照片视图"""
#     parser_classes = [MultiPartParser, FormParser]
#     permission_classes = [IsAuthenticated]
#
#     def post(self, request, *args, **kwargs):
#         try:
#             # 获取相册ID（从前端请求中获取）
#             album_id = request.data.get('album')
#
#             # 验证相册存在且用户有权限
#             album = get_object_or_404(Album, id=album_id)
#
#             # 检查用户是否有权限向该相册上传照片
#             if album.user != request.user:
#                 return Response(
#                     {'error': '没有权限向该相册上传照片'},
#                     status=status.HTTP_403_FORBIDDEN
#                 )
#
#             # 自动设置照片顺序（放在最后）
#             last_order = Photo.objects.filter(album=album).order_by('-order').first()
#             next_order = (last_order.order + 1) if last_order else 1
#
#             # 创建照片数据
#             photo_data = {
#                 'image': request.FILES.get('image'),
#                 'title': request.data.get('title', '').strip() or '未命名照片',
#                 'description': request.data.get('description', ''),
#                 'album': album_id,
#                 'order': next_order
#             }
#
#             # 创建序列化器
#             serializer = PhotoUploadSerializer(
#                 data=photo_data,
#                 context={'request': request}
#             )
#
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#         except Exception as e:
#             return Response(
#                 {'error': str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


class SimplePhotoUploadView(APIView):
    authentication_classes = [LoginAuth]

    def post(self, request):
        """最简单的上传接口"""
        album_id = request.POST.get('album_id')
        image = request.FILES.get('image')

        if not album_id or not image:
            return Response({'error': '缺少参数'}, status=400)

        album = get_object_or_404(Album, id=album_id)

        # 创建照片
        photo = Photo.objects.create(
            album=album,
            image=image,
            title=request.POST.get('title', ''),
            description=request.POST.get('description', '')
        )

        return Response({
            'id': photo.id,
            'image_url': request.build_absolute_uri(photo.image.url),
            'title': photo.title,
            'uploaded_at': photo.uploaded_at
        })