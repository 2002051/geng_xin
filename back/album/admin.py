from django.contrib import admin
from .models import Album, Photo  # 导入所有模型

# 基本注册方式
admin.site.register(Album)
admin.site.register(Photo)
