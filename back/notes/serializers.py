from rest_framework import serializers
from .models import Note, NoteCategory, NoteTag, NoteComment
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    """用户简单信息序列化器"""

    class Meta:
        model = User
        fields = ['id', 'username', 'avatar']


class NoteTagSerializer(serializers.ModelSerializer):
    """标签序列化器"""

    class Meta:
        model = NoteTag
        fields = ['id', 'name', 'slug', 'color']


class NoteCategorySerializer(serializers.ModelSerializer):
    """分类序列化器"""

    class Meta:
        model = NoteCategory
        fields = ['id', 'name', 'slug', 'description', 'icon']


class NoteListSerializer(serializers.ModelSerializer):
    """笔记列表序列化器（轻量级）"""
    user = UserSimpleSerializer(read_only=True)
    category = NoteCategorySerializer(read_only=True)
    tags = NoteTagSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            'id', 'title', 'summary', 'cover_image', 'user',
            'category', 'tags', 'view_count', 'like_count', 'comment_count',
            'is_public', 'created_at', 'updated_at', 'published_at'
        ]

    def get_cover_image(self, obj):
        if obj.cover_image and hasattr(obj.cover_image, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
        return None


class NoteDetailSerializer(serializers.ModelSerializer):
    """笔记详情序列化器（完整内容）"""
    user = UserSimpleSerializer(read_only=True)
    category = NoteCategorySerializer(read_only=True)
    tags = NoteTagSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            'id', 'title', 'content', 'summary', 'cover_image',
            'user', 'category', 'tags',
            'view_count', 'like_count', 'comment_count',
            'is_public', 'allow_comment', 'is_liked', 'is_favorited',
            'created_at', 'updated_at', 'published_at'
        ]

    def get_cover_image(self, obj):
        if obj.cover_image and hasattr(obj.cover_image, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
        return None

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # 这里需要实现点赞关系
            return False
        return False

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # 这里需要实现收藏关系
            return False
        return False


class NoteCreateUpdateSerializer(serializers.ModelSerializer):
    """创建/更新笔记序列化器"""
    cover_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Note
        fields = [
            'id', 'title', 'content', 'summary', 'cover_image',
            'category', 'tags', 'is_public', 'allow_comment'
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class NoteCommentSerializer(serializers.ModelSerializer):
    """评论序列化器"""
    user = UserSimpleSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = NoteComment
        fields = [
            'id', 'user', 'content', 'parent', 'like_count',
            'replies', 'created_at', 'updated_at'
        ]

    def get_replies(self, obj):
        if obj.replies.exists():
            return NoteCommentSerializer(obj.replies.filter(is_deleted=False), many=True, context=self.context).data
        return []