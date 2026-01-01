from django.utils.deprecation import MiddlewareMixin
# 响应头中 添加 Access-Control-Allow-Origin
from django.http import HttpResponse


class CorsMiddleWare(MiddlewareMixin):
    def process_request(self, request):
        """处理 OPTIONS 预检请求"""
        if request.method == 'OPTIONS':
            print(f"处理 OPTIONS 预检请求: {request.path}")
            response = HttpResponse()
            response['Content-Length'] = '0'
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Headers'] = '*'
            response['Access-Control-Allow-Methods'] = '*'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'  # 24小时缓存
            return response
        return None

    def process_response(self, request, response):
        """给所有响应添加 CORS 头"""
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        response["Access-Control-Allow-Credentials"] = "true"
        return response