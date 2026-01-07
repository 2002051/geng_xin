from django.db import models


# Create your models here.

class LoginImage(models.Model):
    """登录界面背景图"""
    image = models.ImageField("登录背景图", upload_to='loginBackgroundImg/%Y/%m/%d/',
                              blank=True, null=True, default='loginBackgroundImg/default.jpg')
    created_at = models.DateTimeField("创建时间", auto_now_add=True)
    class Meta:
        verbose_name = '登录界面背景图'
        verbose_name_plural = verbose_name

