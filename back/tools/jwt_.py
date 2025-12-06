import jwt
from django.conf import settings


def get_jwt(payload):
    """
    payload = {
            'user_id': user_object.id,  # 自定义用户ID
            'username': user_object.user,  # 自定义用户名
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=5)  # 超时时间
        }
        """
    headers = {
        'typ': 'jwt',
        'alg': 'HS256'
    }
    payload = payload
    token = jwt.encode(payload=payload, key=settings.SECRET_KEY, algorithm="HS256", headers=headers)
    return token
