from django.conf import settings
import jwt
from datetime import datetime
from functools import wraps
from django.http import JsonResponse

def generate_jwt_token(user):
    payload = {
        'user_id': user.id,
        'email': user.email,
        'is_admin': user.is_admin,
        'exp': datetime.utcnow() + settings.JWT_EXPIRATION_DELTA
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')

def token_required(view_func):
    """
    Decorator to protect views with JWT authentication.
    Checks for JWT token in cookie first, then falls back to Authorization header.
    """
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        token = request.COOKIES.get('jwt')
        if not token:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return JsonResponse({'error': 'No token provided'}, status=401)
            token = auth_header.split(' ')[1] # Bearer<space>uegh7840812-0342-TOKEN
        
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
            request.user_id = payload['user_id']
            request.user_email = payload['email']
            request.is_admin = payload['is_admin']
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)
            
        return view_func(request, *args, **kwargs)
    return wrapped_view
