from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from .models import Note, NoteCategory, NoteTag, NoteComment
from .serializers import (
    NoteListSerializer, NoteDetailSerializer, NoteCreateUpdateSerializer,
    NoteCategorySerializer, NoteTagSerializer, NoteCommentSerializer
)


class NoteViewSet(viewsets.ModelViewSet):
    """笔记视图集"""
    queryset = Note.objects.filter(is_public=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags', 'is_public']
    search_fields = ['title', 'content', 'summary']
    ordering_fields = ['created_at', 'updated_at', 'view_count', 'like_count']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = Note.objects.all()

        # 非管理员只能看到自己的私有笔记和所有人的公开笔记
        if not user.is_staff:
            queryset = queryset.filter(
                Q(is_public=True) | Q(user=user)
            )

        # 添加注释统计
        queryset = queryset.annotate(
            comment_count=Count('comments', filter=Q(comments__is_deleted=False))
        )

        return queryset.select_related('user', 'category').prefetch_related('tags')

    def get_serializer_class(self):
        if self.action == 'list':
            return NoteListSerializer
        elif self.action == 'retrieve':
            return NoteDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return NoteCreateUpdateSerializer
        return NoteDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # 增加浏览量（只对公开笔记且不是作者本人）
        if instance.is_public and instance.user != request.user:
            instance.increase_view()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """点赞/取消点赞"""
        note = self.get_object()
        # 这里需要实现点赞逻辑
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def favorite(self, request, pk=None):
        """收藏/取消收藏"""
        note = self.get_object()
        # 这里需要实现收藏逻辑
        return Response({'status': 'success'})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """获取笔记统计信息"""
        user = request.user
        if user.is_authenticated:
            stats = {
                'total_notes': Note.objects.filter(user=user).count(),
                'public_notes': Note.objects.filter(user=user, is_public=True).count(),
                'private_notes': Note.objects.filter(user=user, is_public=False).count(),
                'total_views': Note.objects.filter(user=user).aggregate(total=models.Sum('view_count'))['total'] or 0,
                'total_likes': Note.objects.filter(user=user).aggregate(total=models.Sum('like_count'))['total'] or 0,
            }
            return Response(stats)
        return Response({'detail': '请先登录'}, status=401)


class NoteCategoryViewSet(viewsets.ModelViewSet):
    """笔记分类视图集"""
    queryset = NoteCategory.objects.all()
    serializer_class = NoteCategorySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NoteTagViewSet(viewsets.ModelViewSet):
    """笔记标签视图集"""
    queryset = NoteTag.objects.all()
    serializer_class = NoteTagSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NoteCommentViewSet(viewsets.ModelViewSet):
    """评论视图集"""
    queryset = NoteComment.objects.filter(is_deleted=False)
    serializer_class = NoteCommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        note_id = self.request.query_params.get('note')
        if note_id:
            return self.queryset.filter(note_id=note_id, parent=None)
        return self.queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)