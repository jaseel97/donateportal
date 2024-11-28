from django.conf import settings
import jwt
from datetime import datetime, timezone
from functools import wraps
from django.http import JsonResponse

def generate_jwt_token(input):
    payload = {
        'username': input['username'],
        'email': input['email'],
        'is_staff': input['is_staff'],
        'user_type':input['user_type'],
        'exp': datetime.now(timezone.utc) + settings.JWT_EXPIRATION_DELTA
    }
    if input['user_type'] in ['Organization', 'organization']:
        payload['latitude'] = input['latitude'][0]
        payload['longitude'] = input['longitude']
    print("PAYLOAD : ", payload)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')

def token_required(allowed_user_types=None):
    """
    Decorator to protect views with JWT authentication.
    Checks for JWT token in cookie first, then falls back to Authorization header.
    
    Parameters:
    allowed_user_types (list, optional): List of user types allowed to access the view.
    If None, all authenticated users are allowed.
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            # Get token from cookie or Authorization header
            token = request.COOKIES.get('jwt')
            if not token:
                auth_header = request.headers.get('Authorization')
                if not auth_header or not auth_header.startswith('Bearer '):
                    return JsonResponse({
                        'error': 'No token provided'
                    }, status=401)
                token = auth_header.split(' ')[1]
            
            try:
                # Decode token
                payload = jwt.decode(
                    token, 
                    settings.JWT_SECRET, 
                    algorithms=['HS256']
                )
                
                # Set user information in request
                request.username = payload['username']
                request.user_email = payload['email']
                request.is_staff = payload['is_staff']
                request.user_type = payload['user_type']
                
                # Check token expiration
                exp_timestamp = payload['exp']
                if datetime.now(timezone.utc).timestamp() > exp_timestamp:
                    return JsonResponse({
                        'error': 'Token has expired'
                    }, status=401)
                
                # Check user type if specified
                if allowed_user_types and request.user_type not in allowed_user_types:
                    return JsonResponse({
                        'error': 'Unauthorized user type',
                        'required_types': allowed_user_types, 
                        'current_type': request.user_type
                    }, status=403)
                
            except jwt.ExpiredSignatureError:
                return JsonResponse({
                    'error': 'Token has expired'
                }, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({
                    'error': 'Invalid token'
                }, status=401)
            except KeyError as e:
                return JsonResponse({
                    'error': f'Invalid token format: missing {str(e)}'
                }, status=401)
            
            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator
