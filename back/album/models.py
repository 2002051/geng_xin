from django.db import models
from login.models import Guser


class Album(models.Model):
    """相册模型"""
    # 基本信息
    name = models.CharField('相册名称', max_length=100)
    detail = models.TextField('相册详情', blank=True, null=True)

    cover_photo = models.ImageField('相册封面', upload_to='cover_photo/%Y/%m/',default="cover_photo/default.jpg")

    # 关联用户
    user = models.ForeignKey(Guser, on_delete=models.CASCADE, verbose_name='创建者')

    # 时间戳
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    # 是否公开
    is_public = models.BooleanField('是否公开', default=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = '相册'
        verbose_name_plural = '相册'

    def __str__(self):
        return self.name

    @property
    def photo_count(self):
        """照片数量"""
        return self.photo_set.count()


class Photo(models.Model):
    """照片模型"""
    # 关联相册
    album = models.ForeignKey(Album, on_delete=models.CASCADE, verbose_name='所属相册',related_name = 'photos')

    # 图片文件
    image = models.ImageField('图片', upload_to='photos/%Y/%m/')

    # 基本信息
    title = models.CharField('照片标题', max_length=100, blank=True, null=True)
    description = models.TextField('照片描述', blank=True, null=True)

    # 上传时间
    uploaded_at = models.DateTimeField('上传时间', auto_now_add=True)

    # 排序
    order = models.IntegerField('排序', default=0)

    class Meta:
        ordering = ['order', '-uploaded_at']
        verbose_name = '照片'
        verbose_name_plural = '照片'

    def __str__(self):
        return self.title or f"照片 {self.id}"

# class Article(models.Model):
