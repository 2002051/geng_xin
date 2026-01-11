from django.urls import path
from album.views import AlbumViewSet, PhotoViewSet, AlbumListViewSet,SimplePhotoUploadView

urlpatterns = [
    path("uploadPhoto/",SimplePhotoUploadView.as_view()),
    path("", AlbumViewSet.as_view({
        "get": "list",  # 获取列表
        "post": "create"  # 创建
    }), name="album-list"),
    path("<int:pk>/", AlbumViewSet.as_view({
        "get": "retrieve",  # 获取单个
        "put": "update",  # 更新
        "patch": "partial_update",  # 部分更新
        "delete": "destroy"  # 删除
    }), name="album-detail"),
    path("photos/", PhotoViewSet.as_view({
        "get": "list",  # 获取列表
        "post": "create"  # 创建
    }), name="photo-list"),
    path("photos/<int:pk>/", PhotoViewSet.as_view({
        "get": "retrieve",  # 获取单个
        "put": "update",  # 更新
        "patch": "partial_update",  # 部分更新
        "delete": "destroy"  # 删除
    }), name="photo-detail"),
    path("list/", AlbumListViewSet.as_view({"get": "list"})),
]
