from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.NoteViewSet, basename='note')
router.register(r'', views.NoteCategoryViewSet, basename='category')
router.register(r'', views.NoteTagViewSet, basename='tag')
router.register(r'', views.NoteCommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
]