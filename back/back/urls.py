"""
URL configuration for back project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from rest_framework.routers import DefaultRouter
from django.contrib import admin
from django.urls import path
from django.urls import path,include
from back import settings
from django.conf.urls.static import static
from login.views import GuserViewSet
from appsetting.views import LoginImageViewSet
router = DefaultRouter()
router.register(r'profiles', GuserViewSet, basename='Guserprofile')
router.register(r'loginImg',LoginImageViewSet,basename="LoginImage")

urlpatterns = [
    path('admin/', admin.site.urls),
    path("login/",include("login.urls")),
    path("album/",include("album.urls")),
    path('api/', include(router.urls)),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
