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
        extra_kwargs = {
            'cover_photo': {
                'required': False,
                'allow_null': True
            }
        }

    def to_representation(self, instance):
        """获取数据时：将相对路径拼接为完整URL"""
        data = super().to_representation(instance)

        # 处理 cover_photo 字段
        if instance.cover_photo and hasattr(instance.cover_photo, 'url'):
            request = self.context.get('request')
            if request:
                data['cover_photo'] = request.build_absolute_uri(instance.cover_photo.url)

        return data

    def to_internal_value(self, data):
        """
        处理传入的数据：如果收到的是字符串路径，跳过文件验证
        同时处理POST和PUT请求
        """
        # 检查 cover_photo 是否是字符串（路径）
        if 'cover_photo' in data and isinstance(data['cover_photo'], str):
            # 保存 cover_photo 路径
            self._cover_photo_path = data.pop('cover_photo')

        return super().to_internal_value(data)

    def create(self, validated_data):
        """创建时处理 cover_photo 路径"""
        instance = super().create(validated_data)

        # 如果有保存的路径字符串，设置回去
        if hasattr(self, '_cover_photo_path') and self._cover_photo_path:
            # 这里需要根据你的模型实际情况来处理
            # 假设你的 cover_photo 字段存储的是路径
            instance.cover_photo = self._cover_photo_path
            instance.save(update_fields=['cover_photo'])

        return instance

    def update(self, instance, validated_data):
        """更新时处理 cover_photo 路径"""
        instance = super().update(instance, validated_data)

        # 如果有保存的路径字符串，设置回去
        if hasattr(self, '_cover_photo_path') and self._cover_photo_path:
            instance.cover_photo = self._cover_photo_path
            instance.save(update_fields=['cover_photo'])

        return instance

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