# api/models.py
from django.utils import timezone

from django.contrib.auth.models import AbstractUser
from django.db import models


class Guser(models.Model):
    # 情侣应用特有字段
    username = models.CharField("用户名", max_length=64, unique=True)
    password = models.CharField("密码", max_length=64, unique=True)
    # 个人资料
    GENDER_CHOICES = [
        ('M', '男'),
        ('F', '女'),
        ('O', '其他'),
        ('U', '未知'),
    ]
    gender = models.CharField("性别", max_length=1, choices=GENDER_CHOICES, default='U')
    avatar = models.ImageField("头像", upload_to='avatars/%Y/%m/%d/',
                               blank=True, null=True, default='avatars/default.jpg')
    signature = models.CharField("个性签名", max_length=200, blank=True, default='')

    # 时间相关
    created_at = models.DateTimeField("创建时间", auto_now_add=True)
    updated_at = models.DateTimeField("更新时间", auto_now=True)

    class Meta:
        verbose_name = '用户'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.username

    # phone = models.CharField('手机号', max_length=11, unique=True)
    # nickname = models.CharField('昵称', max_length=50, blank=True)
    # avatar = models.ImageField('头像', upload_to='avatars/', null=True, blank=True)
    # gender = models.CharField('性别', max_length=10, choices=[('male', '男'), ('female', '女')], blank=True)
    # birthday = models.DateField('生日', null=True, blank=True)
    #
    # # 情侣关系
    # partner = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='partners')
    # relationship_start = models.DateField('恋爱开始日', null=True, blank=True)