import os
import json
import re

from django.contrib.gis.geos import Point
from django.contrib.gis.measure import Distance
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout

from api.jwt import generate_jwt_token, token_required
from api.validation import validate_organization_data, validate_samaritan_data

from .models import Organization, Item, Samaritan
from .constants import user_type_organization, user_type_samaritan


def index(request):
    return JsonResponse({'msg': 'API is running'}, status=200)

#------------------------------------------------- Auth Views -------------------------------------------------#
@csrf_exempt
def signup_organization(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
    try:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        
        is_valid, error_message = validate_organization_data(data)
        
        print("Validation Complete!")
        
        if not is_valid:
            return JsonResponse({'error': error_message}, status=400)
        
        # Extract nested data
        location_data = data.pop('location')
        point = Point(location_data['longitude'], location_data['latitude'])
        address_data = data.pop('address')
        
        # Create user data dictionary
        user_data = {
            'username': data.get('username'),
            'email': data.get('email'),
            'password': data.get('password'),
            'is_staff':False
        }
        
        # Create organization-specific data dictionary
        org_data = {
            'name': data.get('name'),
            'location': point,
            'address_line1': address_data.get('address_line1'),
            'address_line2': address_data.get('address_line2'),
            'city': address_data.get('city'),
            'province': address_data.get('province'),
            'postal_code': address_data.get('postal_code'),
        }
        
        # Create the organization user
        organization = Organization.objects.create(
            **user_data,
            **org_data
        )
        
        # Set password properly
        organization.set_password(user_data['password'])
        organization.save()
        
        print("Testing...")
        print(organization.username)
        
        token = generate_jwt_token({
            'username': organization.username,
            'email': organization.email,
            'is_staff': False,
            'user_type': organization.user_type,
        })
        
        response = JsonResponse({
            'message': 'Sign up is successful',
        })
        
        response.set_cookie(
            key='jwt',
            value=token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=24 * 60 * 60
        )
        
        return response
    
    except Exception as e:
        print(f"Error during user creation: {str(e)}")
        return JsonResponse({
            'error': 'Failed to create new account'
        }, status=500)

@csrf_exempt
def signup_samaritan(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
    try:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        
        is_valid, error_message = validate_samaritan_data(data)
        
        print("Validation Complete!")
        
        if not is_valid:
            return JsonResponse({'error': error_message}, status=400)
        
        # Create user data dictionary
        user_data = {
            'username': data.get('username'),
            'email': data.get('email'),
            'password': data.get('password'),
            'is_staff':False
        }
        
        address_data = data.pop('address')

        # Create samaritan-specific data dictionary
        org_data = {
            'city': address_data.get('city'),
            'province': address_data.get('province'),
        }
        
        # Create the samaritan user
        samaritan = Samaritan.objects.create(
            **user_data,
            **org_data
        )
        
        samaritan.set_password(user_data['password'])
        samaritan.save()
        
        token = generate_jwt_token({
            'username': samaritan.username,
            'email': samaritan.email,
            'is_staff': False,
            'user_type': samaritan.user_type,
        })
        
        response = JsonResponse({
            'message': 'Sign up is successful',
        })
        
        response.set_cookie(
            key='jwt',
            value=token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=24 * 60 * 60
        )
        
        return response
    
    except Exception as e:
        print(f"Error during user creation: {str(e)}")
        return JsonResponse({
            'error': 'Failed to create new account'
        }, status=500)

@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        # First authenticate the user
        user = authenticate(username=username, password=password)
        print('User : ',user)
        
        if user is not None:
            # Get the specific instance (Organization or Samaritan)
            if user.user_type == 'organization':
                specific_user = Organization.objects.get(user=user)
            else:  # samaritan
                specific_user = Samaritan.objects.get(user=user)
            
            # Create token payload
            token_payload = {
                'username': specific_user.username,
                'email': specific_user.email,
                'is_staff': False,
                'user_type': specific_user.user_type,
            }
            
            # Generate token
            token = generate_jwt_token(token_payload)
            
            response = JsonResponse({
                'message': 'Login successful',
            })
            
            response.set_cookie(
                key='jwt',
                value=token,
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=24 * 60 * 60
            )
            
            return response
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
            
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except (Organization.DoesNotExist, Samaritan.DoesNotExist) as e:
        return JsonResponse({'error': 'User type mismatch'}, status=400)
    except Exception as e:
        print(f"Login error: {str(e)}")
        return JsonResponse({'error': 'Login failed'}, status=500)
    
@csrf_exempt
@token_required()
def logout(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
    try:
        response = JsonResponse({'message': 'Successfully logged out'})
        response.delete_cookie(key='jwt')
        return response
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return JsonResponse({'error': 'Logout failed'}, status=500)

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