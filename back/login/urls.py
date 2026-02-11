from django.urls import path
from login import views

urlpatterns = [
    path("in/", views.LoginView.as_view()),  # 登录
    # path("register/", views.RegisterView.as_view()),# 注册
    # path("out/", views.LoginView.as_view()), # 登出
    path("profiles/<int:pk>/", views.GuserViewSet.as_view({"get": "retrieve",  # 获取单个
                                                           "put": "update",  # 更新
                                                           "patch": "partial_update",  # 部分更新
                                                           "delete": "destroy"}))  # 获取用户信息
]
