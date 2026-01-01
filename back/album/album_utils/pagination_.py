from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage


class AlbumPagination(PageNumberPagination):
    """自定义相册分页器"""
    page_size = 10  # 默认每页10条
    page_size_query_param = 'page_size'  # 允许前端指定每页数量
    max_page_size = 50  # 最大每页50条
    page_query_param = 'page'  # 页码参数名

    def get_paginated_response(self, data):
        """自定义分页响应格式"""
        return Response({
            'count': self.page.paginator.count,  # 总数量
            'next': self.get_next_link(),  # 下一页链接
            'previous': self.get_previous_link(),  # 上一页链接
            'total_pages': self.page.paginator.num_pages,  # 总页数
            'current_page': self.page.number,  # 当前页码
            'page_size': self.page.paginator.per_page,  # 每页数量
            'results': data  # 数据
        })