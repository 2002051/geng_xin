from django.db import models
from django.contrib.auth import get_user_model
from ckeditor_uploader.fields import RichTextUploadingField
from django.utils import timezone

User = get_user_model()


class Note(models.Model):
    """笔记模型"""
    # 基础信息
    title = models.CharField('标题', max_length=200)
    content = RichTextUploadingField('内容', config_name='default')
    summary = models.TextField('摘要', max_length=500, blank=True, help_text='不填则自动截取')

    # 分类与标签
    category = models.ForeignKey('NoteCategory', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='分类')
    tags = models.ManyToManyField('NoteTag', blank=True, verbose_name='标签')

    # 封面图片
    cover_image = models.ImageField('封面图片', upload_to='notes/covers/%Y/%m/', blank=True, null=True)

    # 统计信息
    view_count = models.PositiveIntegerField('浏览量', default=0)
    like_count = models.PositiveIntegerField('点赞数', default=0)
    comment_count = models.PositiveIntegerField('评论数', default=0)

    # 权限设置
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes', verbose_name='作者')
    is_public = models.BooleanField('是否公开', default=True)
    allow_comment = models.BooleanField('允许评论', default=True)

    # 时间信息
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    published_at = models.DateTimeField('发布时间', null=True, blank=True)

    class Meta:
        verbose_name = '笔记'
        verbose_name_plural = '笔记'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # 自动生成摘要
        if not self.summary and self.content:
            # 去除HTML标签，截取前200个字符
            import re
            text = re.sub('<[^<]+?>', '', self.content)
            self.summary = text[:200] + ('...' if len(text) > 200 else '')

        # 设置发布时间
        if self.is_public and not self.published_at:
            self.published_at = timezone.now()

        super().save(*args, **kwargs)

    def increase_view(self):
        """增加浏览量"""
        self.view_count += 1
        self.save(update_fields=['view_count'])


class NoteCategory(models.Model):
    """笔记分类"""
    name = models.CharField('分类名称', max_length=50)
    slug = models.SlugField('标识', max_length=50, unique=True)
    description = models.TextField('描述', blank=True)
    icon = models.CharField('图标', max_length=50, blank=True, help_text='Font Awesome图标名称')
    sort_order = models.IntegerField('排序', default=0)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='note_categories', verbose_name='创建者')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = '笔记分类'
        verbose_name_plural = '笔记分类'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class NoteTag(models.Model):
    """笔记标签"""
    name = models.CharField('标签名称', max_length=30)
    slug = models.SlugField('标识', max_length=30, unique=True)
    color = models.CharField('颜色', max_length=20, default='#4CAF50', help_text='十六进制颜色码')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='note_tags', verbose_name='创建者')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = '笔记标签'
        verbose_name_plural = '笔记标签'
        ordering = ['name']

    def __str__(self):
        return self.name


class NoteComment(models.Model):
    """笔记评论"""
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='comments', verbose_name='笔记')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='note_comments', verbose_name='评论者')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies',
                               verbose_name='父评论')
    content = models.TextField('评论内容', max_length=1000)
    like_count = models.PositiveIntegerField('点赞数', default=0)
    is_deleted = models.BooleanField('是否已删除', default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = '评论'
        verbose_name_plural = '评论'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} 评论了 {self.note.title}'