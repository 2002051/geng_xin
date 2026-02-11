from django.utils import timezone
from rest_framework import serializers
from album.models import Album, Photo


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = '__all__'
        read_only_fields = ['uploaded_at']
        depth = 2

class AlbumSerializer(serializers.ModelSerializer):
    photos = PhotoSerializer(many=True, read_only=True)
    photo_count = serializers.IntegerField(read_only=True)
    cover_photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Album
        fields = ['id', 'name', 'detail', 'user', 'created_at',
                  'updated_at', 'photos', 'photo_count', "cover_photo", "is_public"]
        read_only_fields = ['created_at', 'updated_at', 'user']

    def to_representation(self, instance):
        """
        获取数据时：将相对路径拼接为完整URL
        """
        data = super().to_representation(instance)

        # 处理 cover_photo 字段
        if instance.cover_photo and hasattr(instance.cover_photo, 'url'):
            request = self.context.get('request')
            if request:
                data['cover_photo'] = request.build_absolute_uri(instance.cover_photo.url)

        return data

    def create(self, validated_data):
        """
        创建时自动设置当前用户
        注意：这里不需要检查 is_authenticated，因为认证已经通过了
        """
        request = self.context.get('request')
        if request and request.user:
            validated_data['user'] = request.user

        return super().create(validated_data)

class AlbumListSerializer(serializers.ModelSerializer):
    # 获取列表
    # cover_photo = serializers.SerializerMethodField()
    photo_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Album
        fields = ['id', 'name', 'detail', 'user', 'created_at',
                  'updated_at', 'cover_photo', 'photo_count',"is_public","cover_photo"]
        read_only_fields = ['created_at', 'updated_at', 'user']

    # def get_cover_photo(self, obj):
    #     """获取相册的第一张照片"""
    #     first_photo = obj.photos.first()  # 获取第一张照片
    #     if first_photo:
    #         # 创建一个简化的照片数据
    #         request = self.context.get('request')
    #         image_url = first_photo.image.url if first_photo.image else None
    #
    #         if image_url and request:
    #             image_url = request.build_absolute_uri(image_url)
    #
    #         return {
    #             'id': first_photo.id,
    #             'title': first_photo.title,
    #             'image_url': image_url,
    #             'order': first_photo.order
    #         }
    #     return None




class PhotoUploadSerializer(serializers.ModelSerializer):
    """照片上传专用序列化器（可以批量上传）"""

    class Meta:
        model = Photo
        fields = ['image', 'title', 'description', 'order']
        extra_kwargs = {
            'title': {'required': False},
            'description': {'required': False},
            'order': {'required': False},
        }