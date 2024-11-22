import os
import json

from django.contrib.gis.geos import Point
from django.contrib.gis.measure import Distance
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout

from .models import Organization, Item


def index(request):
    return JsonResponse({'msg': 'API is running'}, status=200)

#------------------------------------------------- Auth Views -------------------------------------------------#
# @csrf_exempt
# def signup(request):
#     if request.method != 'POST':
#         return JsonResponse({'error': 'Invalid request method'}, status=400)
    
#     data = json.loads(request.body)
#     email = data.get('email')
#     password = data.get('password')
    
#     if not email or not password:
#         return JsonResponse({'error': 'Email and password are required'}, status=400)
    
#     if User.objects.filter(email=email).exists():
#         return JsonResponse({'error': 'A user with this email already exists'}, status=400)
        
#     try:
#         user = User.objects.create_user(
#             username=email,
#             email=email,
#             password=password
#         )
#         token = generate_jwt_token(user)
#         return JsonResponse({
#             'token': token
#         })
#     except Exception as e:
#         print(f"Error during user creation: {str(e)}")
#         return JsonResponse({'error': 'Failed to create user account'}, status=400)

# @csrf_exempt
# def login_view(request):
#     if request.method != 'POST':
#         return JsonResponse({'error': 'Invalid request method'}, status=400)
    
#     data = json.loads(request.body)
#     email = data.get('email')
#     password = data.get('password')
    
#     user = authenticate(username=email, password=password)
#     if user is not None:
#         token = generate_jwt_token(user)
        
#         response = JsonResponse({
#             'message': 'Login successful',
#         })
        
#         response.set_cookie(
#             key='jwt',
#             value=token,
#             httponly=True,
#             secure=False,  # false since HTTPS terminates at nginx
#             samesite='Lax',  
#             max_age=24 * 60 * 60  # 24 hours in seconds
#         )
        
#         return response
#     else:
#         return JsonResponse({'error': 'Invalid credentials'}, status=401)

# @token_required
# @csrf_exempt
# def logout_view(request):
#     if request.method != 'POST':
#         return JsonResponse({'error': 'Invalid request method'}, status=400)
    
#     response = JsonResponse({'message': 'Successfully logged out'})
#     # Delete the JWT cookie with the same parameters as when it was set
#     response.delete_cookie(
#         key='jwt'
#     )

#     return response

# @token_required
# def change_password(request):
#     if request.method != 'POST':
#         return JsonResponse({'error': 'Invalid request method'}, status=400)
        
#     data = json.loads(request.body)
#     old_password = data.get('old_password')
#     new_password = data.get('new_password')
    
#     try:
#         user = User.objects.get(id=request.user_id)
#         if user.check_password(old_password):
#             user.set_password(new_password)
#             user.save()
#             return JsonResponse({'message': 'Password successfully changed'})
#         else:
#             return JsonResponse({'error': 'Current password is incorrect'}, status=400)
#     except User.DoesNotExist:
#         return JsonResponse({'error': 'User not found'}, status=404)

# @token_required
# def get_user_profile(request):
#     if request.method != 'GET':
#         return JsonResponse({'error': 'Invalid request method'}, status=400)
    
#     return JsonResponse({
#         'email': request.user_email,
#         'is_admin': request.is_admin
#     })

# @csrf_exempt
# def request_password_reset(request):
#     if request.method != 'POST':
#         return JsonResponse({'error': 'Invalid request method'}, status=400)
    
#     data = json.loads(request.body)
#     email = data.get('email')
    
#     try:
#         user = User.objects.get(email=email)
#         token = default_token_generator.make_token(user)
#         uid = urlsafe_base64_encode(force_bytes(user.pk))
        
#         reset_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/reset-password/{uid}/{token}"
#         send_mail(
#             'Password Reset Request',
#             f'Click the following link to reset your password: {reset_url}',
#             settings.DEFAULT_FROM_EMAIL,
#             [email],
#             fail_silently=False,
#         )
#         return JsonResponse({'message': 'Password reset email sent'})
#     except User.DoesNotExist:
#         return JsonResponse({'error': 'User not found'}, status=404)

# @csrf_exempt
# def reset_password(request):
#     if request.method != 'POST':
#         return JsonResponse({'error': 'Invalid request method'}, status=400)
    
#     data = json.loads(request.body)
#     password = data.get('password')
#     token = data.get('token')
#     uidb64 = data.get('uid')
    
#     try:
#         uid = force_str(urlsafe_base64_decode(uidb64))
#         user = User.objects.get(pk=uid)
        
#         if default_token_generator.check_token(user, token):
#             user.set_password(password)
#             user.save()
#             return JsonResponse({'message': 'Password successfully reset'})
#         else:
#             return JsonResponse({'error': 'Invalid reset link'}, status=400)
#     except (TypeError, ValueError, OverflowError, User.DoesNotExist):
#         return JsonResponse({'error': 'Invalid reset link'}, status=400)




#------------------------------------------------- App Views -------------------------------------------------#


class ItemView(View):
    @staticmethod
    def get(request):
        #TODO: Get radius and items per page from environment or default values
        radius_km = float(request.GET.get('radius', os.getenv('DEFAULT_RADIUS', 5)))
        items_per_page = int(os.getenv('ITEMS_PER_PAGE', 10))
        category = request.GET.get('category')
        weight_min = request.GET.get('weight_min')
        weight_max = request.GET.get('weight_max')
        page_number = request.GET.get('page', 1)

        #TODO: Get the organization based on the logged-in user
        try:
            organization = Organization.objects.get(id=request.user.id)
            if not organization.location:
                return JsonResponse({"error": "Organization location is not available"}, status=400)
        except Organization.DoesNotExist:
            return JsonResponse({"error": "Organization not found"}, status=404)

        radius_m = radius_km * 1000

        queryset = Item.objects.filter(reserved_by__isnull=True)
        if category:
            queryset = queryset.filter(category=category)
        if weight_min:
            queryset = queryset.filter(weight__gte=weight_min)
        if weight_max:
            queryset = queryset.filter(weight__lte=weight_max)

        queryset = queryset.filter(
            pickup_location__distance_lte=(organization.location, radius_m)
        ).annotate(
            distance=Distance("pickup_location", organization.location)
        ).order_by("distance")

        paginator = Paginator(queryset, items_per_page)
        page_obj = paginator.get_page(page_number)

        items_data = [
            {
                "id": item.id,
                "category": item.category,
                "description": item.description,
                "weight": item.weight,
                "weight_unit": item.weight_unit,
                "volume": item.volume,
                "volume_unit": item.volume_unit,
                "best_before": item.best_before,
                "pickup_location": {
                    "latitude": item.pickup_location.y,
                    "longitude": item.pickup_location.x
                },
                "distance_km": round(item.distance.km, 2),
                "reserved_till": item.reserved_till,
                "posted_by": item.posted_by.id,
                "pickup_time": item.pickup_time,
                "is_picked_up": item.is_picked_up,
            }
            for item in page_obj
        ]

        return JsonResponse({
            "page": page_number,
            "total_pages": paginator.num_pages,
            "total_items": paginator.count,
            "items": items_data
        }, status=200)

    @staticmethod
    def post(request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

        try:
            organization = Organization.objects.get(id=request.user.id)
        except Organization.DoesNotExist:
            return JsonResponse({"error": "Organization not found"}, status=404)

        item = Item(
            category = data.get("category"),
            description = data.get("description"),
            weight = data.get("weight"),
            weight_unit = data.get("weight_unit"),
            volume = data.get("volume"),
            volume_unit = data.get("volume_unit"),
            best_before = data.get("best_before"),
            pickup_location = Point(data.get("longitude"), data.get("latitude")),
            posted_by = organization,
            pickup_time = data.get("pickup_time"),
            is_picked_up = False
        )

        try:
            item.save()
            return JsonResponse({"success": "Item created successfully", "item_id": item.id}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)