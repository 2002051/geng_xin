from django.urls import path
from login import views

urlpatterns = [
    path("in/", views.LoginView.as_view()), # 登录
    # path("register/", views.RegisterView.as_view()),# 注册
    # path("out/", views.LoginView.as_view()), # 登出
    # path("getUserDetail/", views.LoginView.as_view()), # 获取用户信息
]
