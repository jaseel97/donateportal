from datetime import date, datetime
import os
import json
import re

from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D, Distance 
from django.contrib.gis.db.models.functions import Distance as DistanceDBFunction

from django.core.paginator import Paginator
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout

from api.jwt import generate_jwt_token, token_required
from api.validation import validate_category, validate_coordinates, validate_organization_data, validate_samaritan_data

from .models import Organization, Item, Samaritan


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
        
        print("Validation Complete! isValid : ", is_valid)
        
        if not is_valid:
            return JsonResponse({'error': error_message}, status=400)
        
        # flatten
        location_data = data.pop('location')
        point = Point(location_data['longitude'], location_data['latitude'])
        address_data = data.pop('address')
        
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
        
        organization = Organization.objects.create(
            **user_data,
            **org_data
        )
        
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
        
        print("Validation Complete! isValid : ", is_valid)
        
        if not is_valid:
            return JsonResponse({'error': error_message}, status=400)
        
        user_data = {
            'username': data.get('username'),
            'email': data.get('email'),
            'password': data.get('password'),
            'is_staff':False
        }
        
        address_data = data.pop('address')

        org_data = {
            'city': address_data.get('city'),
            'province': address_data.get('province'),
        }
        
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
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            if user.user_type == 'organization':
                specific_user = Organization.objects.get(user=user)
            else:  # samaritan
                specific_user = Samaritan.objects.get(user=user)
            
            token_payload = {
                'username': specific_user.username,
                'email': specific_user.email,
                'is_staff': False,
                'user_type': specific_user.user_type,
            }
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
@csrf_exempt
@token_required()
def get_categories(request):
    try:
        categories = dict(Item.CATEGORY_CHOICES)
        return JsonResponse({
            "options" : categories
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@token_required()
def donate_item(request):
    if request.method != 'POST':
        return JsonResponse({
            "error": "Method not allowed"
        }, status=405)
    
    if request.user_type != 'samaritan':
        return JsonResponse({
            "error": "Only samaritans can donate items"
        }, status=403)
    
    try:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({
                "error": "Invalid JSON format"
            }, status=400)
        
        required_fields = ['category', 'description', 'pickup_location']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return JsonResponse({
                "error": "Missing required fields",
                "missing_fields": missing_fields
            }, status=400)

        category = data.get('category', None)
        valid, error, valid_categories = validate_category(category)
        if not valid:
            return JsonResponse({
                "error": error,
                "options": valid_categories
            }, status=400)
        

        location = data['pickup_location']
        valid, error = validate_coordinates(location)
        if not valid:
            return JsonResponse({
                "error": error
            }, status=400)
            
        pickup_location = Point(location['longitude'], location['latitude'])
        
        try:
            weight = data.get('weight')
            if weight is not None:
                weight = float(weight)
                if weight <= 0:
                    return JsonResponse({"error": "Weight must be positive"}, status=400)
            
            volume = data.get('volume')
            if volume is not None:
                volume = float(volume)
                if volume <= 0:
                    return JsonResponse({"error": "Volume must be positive"}, status=400)
        except (ValueError, TypeError):
            return JsonResponse({
                "error": "Invalid weight or volume format"
            }, status=400)
        
        # Validate best_before date --------------------> not needed ?
        best_before = data.get('best_before')
        if best_before:
            try:
                best_before = datetime.strptime(best_before, '%Y-%m-%d').date()
                if best_before < date.today():
                    return JsonResponse({
                        "error": "Best before date cannot be in the past"
                    }, status=400)
            except ValueError:
                return JsonResponse({
                    "error": "Invalid best_before date format. Use YYYY-MM-DD"
                }, status=400)
        
        # Get the samaritan
        try:
            samaritan = Samaritan.objects.get(username=request.username)
        except Samaritan.DoesNotExist:
            return JsonResponse({
                "error": "Samaritan not found"
            }, status=404)
        
        # Create the item
        item = Item.objects.create(
            category=category,
            description=data['description'],
            pickup_location=pickup_location,
            posted_by=samaritan,
            weight=weight if 'weight' in data else None,
            weight_unit=data.get('weight_unit'),
            volume=volume if 'volume' in data else None,
            volume_unit=data.get('volume_unit'),
            best_before=best_before if best_before else None
        )
        
        return JsonResponse({
            "message": "Item donated successfully",
            "item": {
                "id": item.id,
                "category": {
                    "id": item.category,
                    "name": dict(Item.CATEGORY_CHOICES)[item.category]
                },
                "description": item.description,
                "pickup_location": {
                    "latitude": item.pickup_location.y,
                    "longitude": item.pickup_location.x
                },
                "posted_by": {
                    "id": samaritan.id,
                    "username": samaritan.username
                },
                "weight": {
                    "value": float(item.weight),
                    "unit": item.weight_unit
                } if item.weight is not None else None,
                "volume": {
                    "value": float(item.volume),
                    "unit": item.volume_unit
                } if item.volume is not None else None,
                "best_before": item.best_before.isoformat() if item.best_before else None,
                "created_at": item.created_at.isoformat() if hasattr(item, 'created_at') else None
            }
        }, status=201)
        
    except Exception as e:
        return JsonResponse({
            "error": f"Internal server error: {str(e)}"
        }, status=500)
    
@csrf_exempt
@token_required()
def get_item_listings_for_organizations(request):

    if request.user_type != 'organization':
        return JsonResponse({"error": "forbidden for samaritans"}, status=403)
    
    try:
        organization = Organization.objects.get(username=request.username)
        if not organization.location:
            return JsonResponse({"error": "Organization location not set"}, status=400)
        
        try:
            items_per_page = int(request.GET.get('items_per_page', os.getenv('ITEMS_PER_PAGE', 25)))
            if items_per_page <= 0:
                return JsonResponse({"error": "Items per page must be positive"}, status=400)
        except ValueError:
            return JsonResponse({"error": "Invalid items_per_page parameter"}, status=400)
            
        try:
            page_number = int(request.GET.get('page', 1))
            if page_number <= 0:
                return JsonResponse({"error": "Page number must be positive"}, status=400)
        except ValueError:
            return JsonResponse({"error": "Invalid page number"}, status=400)
        
        try:
            radius_km = float(request.GET.get('radius', os.getenv('DEFAULT_RADIUS', 5)))
            if radius_km <= 0:
                return JsonResponse({"error": "Radius must be positive"}, status=400)
            radius_m = radius_km * 1000
        except ValueError:
            return JsonResponse({"error": "Invalid radius parameter"}, status=400)
        
        try:
            category = request.GET.get('category')
            if category is not None:
                category = int(category)
                valid_categories = dict(Item.CATEGORY_CHOICES).keys()
                if category not in valid_categories:
                    return JsonResponse({
                        "error": "Invalid category",
                        "valid_categories": dict(Item.CATEGORY_CHOICES)
                    }, status=400)
        except ValueError:
            return JsonResponse({
                "error": "Category must be a number",
                "valid_categories": dict(Item.CATEGORY_CHOICES)
            }, status=400)
        
        queryset = Item.objects.filter(
            reserved_by__isnull=True,
            is_picked_up=False,
            reserved_till__isnull=True
        )

        if category is not None:
            queryset = queryset.filter(category=category)
        
        try:
            queryset = Item.objects.filter(pickup_location__distance_lte=(organization.location, D(m=radius_m)))

            queryset = queryset.annotate(
                distance=DistanceDBFunction('pickup_location', organization.location)
            ).order_by('distance')

        except Exception as e:
            print(f"Spatial query error: {str(e)}")
            raise Exception(f"Error processing location query: {str(e)}")
        
        try:
            paginator = Paginator(queryset, items_per_page)
            if page_number > paginator.num_pages and paginator.num_pages > 0:
                return JsonResponse({"error": "Page number exceeds available pages"}, status=404)
            page_obj = paginator.get_page(page_number)
        except Exception as e:
            return JsonResponse({"error": f"Pagination error: {str(e)}"}, status=500)
        
        print("Pagination Complete")
        
        items_data = []
        for item in page_obj:
            try:
                item_data = {
                    'id': item.id,
                    'category': {
                        'id': item.category,
                        'name': dict(Item.CATEGORY_CHOICES)[item.category]
                    },
                    'description': item.description,
                    'pickup_location': {
                        'latitude': item.pickup_location.y,
                        'longitude': item.pickup_location.x
                    },
                    'distance_km': round(item.distance.km, 2) if hasattr(item, 'distance') else None,
                    'posted_by': {
                        'id': item.posted_by.id,
                        'username': item.posted_by.username
                    }
                }
                
                if item.weight is not None:
                    item_data['weight'] = {
                        'value': float(item.weight),
                        'unit': item.weight_unit
                    }
                
                if item.volume is not None:
                    item_data['volume'] = {
                        'value': float(item.volume),
                        'unit': item.volume_unit
                    }
                
                if item.best_before is not None:
                    item_data['best_before'] = item.best_before.isoformat()
                
                if item.pickup_time is not None:
                    item_data['pickup_time'] = item.pickup_time.isoformat()
                
                items_data.append(item_data)
                
            except Exception as e:
                return JsonResponse({
                    "error": f"Error processing item data: {str(e)}"
                }, status=500)
        
        return JsonResponse({
            "page": page_number,
            "total_pages": paginator.num_pages,
            "total_items": paginator.count,
            "items": items_data
        }, status=200)
        
    except Organization.DoesNotExist:
        return JsonResponse({"error": "Organization not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)


@token_required()
def get_samaritan_items(request, username):
    if request.user_type != 'samaritan':
        return JsonResponse({"error": "forbidden for organizations"}, status=403)

    try:
        try:
            items_per_page = int(request.GET.get('items_per_page', os.getenv('ITEMS_PER_PAGE', 25)))
            if items_per_page <= 0:
                return JsonResponse({"error": "Items per page must be positive"}, status=400)
        except ValueError:
            return JsonResponse({"error": "Invalid items_per_page parameter"}, status=400)
        
        try:
            page_number = int(request.GET.get('page', 1))
            if page_number <= 0:
                return JsonResponse({"error": "Page number must be positive"}, status=400)
        except ValueError:
            return JsonResponse({"error": "Invalid page number"}, status=400)

        try:
            samaritan = Samaritan.objects.get(user__username=request.username)
        except Samaritan.DoesNotExist:
            return JsonResponse({"error": "Samaritan not found"}, status=404)

        # Get category filter if provided
        try:
            category = request.GET.get('category')
            if category is not None:
                category = int(category)
                valid_categories = dict(Item.CATEGORY_CHOICES).keys()
                if category not in valid_categories:
                    return JsonResponse({
                        "error": "Invalid category",
                        "valid_categories": dict(Item.CATEGORY_CHOICES)
                    }, status=400)
        except ValueError:
            return JsonResponse({
                "error": "Category must be a number",
                "valid_categories": dict(Item.CATEGORY_CHOICES)
            }, status=400)

        all_items = Item.objects.filter(posted_by=samaritan)
        if category is not None:
            all_items = all_items.filter(category=category)

        picked_up_items = all_items.filter(is_picked_up=True)
        not_picked_up_items = all_items.filter(is_picked_up=False)

        try:
            picked_up_paginator = Paginator(picked_up_items, items_per_page)
            not_picked_up_paginator = Paginator(not_picked_up_items, items_per_page)
            
            if  (page_number > picked_up_paginator.num_pages and picked_up_paginator.num_pages > 0) or \
                (page_number > not_picked_up_paginator.num_pages and not_picked_up_paginator.num_pages > 0):
                return JsonResponse({"error": "Page number exceeds available pages"}, status=404)
            
            picked_up_page = picked_up_paginator.get_page(page_number)
            not_picked_up_page = not_picked_up_paginator.get_page(page_number)
        except Exception as e:
            return JsonResponse({"error": f"Pagination error: {str(e)}"}, status=500)

        picked_up_data = []
        not_picked_up_data = []

        for item in picked_up_page:
            try:
                item_data = {
                    'id': item.id,
                    'category': {
                        'id': item.category,
                        'name': dict(Item.CATEGORY_CHOICES)[item.category]
                    },
                    'description': item.description,
                    'pickup_location': {
                        'latitude': item.pickup_location.y,
                        'longitude': item.pickup_location.x
                    },
                    'picked_up_by': {
                        'id': item.picked_up_by.id,
                        'name': item.picked_up_by.name
                    } if item.picked_up_by else None,
                    'scheduled_pickup_time': item.scheduled_pickup_time.isoformat() if item.scheduled_pickup_time else None
                }

                if item.weight is not None:
                    item_data['weight'] = {
                        'value': float(item.weight),
                        'unit': item.weight_unit
                    }

                if item.volume is not None:
                    item_data['volume'] = {
                        'value': float(item.volume),
                        'unit': item.volume_unit
                    }

                if item.best_before is not None:
                    item_data['best_before'] = item.best_before.isoformat()

                picked_up_data.append(item_data)

            except Exception as e:
                return JsonResponse({
                    "error": f"Error processing picked up item data: {str(e)}"
                }, status=500)

        for item in not_picked_up_page:
            try:
                item_data = {
                    'id': item.id,
                    'category': {
                        'id': item.category,
                        'name': dict(Item.CATEGORY_CHOICES)[item.category]
                    },
                    'description': item.description,
                    'pickup_location': {
                        'latitude': item.pickup_location.y,
                        'longitude': item.pickup_location.x
                    },
                    'is_reserved': item.is_reserved,
                    'reserved_by': {
                        'id': item.reserved_by.id,
                        'name': item.reserved_by.name
                    } if item.reserved_by else None,
                    'reserved_till': item.reserved_till.isoformat() if item.reserved_till else None
                }

                if item.weight is not None:
                    item_data['weight'] = {
                        'value': float(item.weight),
                        'unit': item.weight_unit
                    }

                if item.volume is not None:
                    item_data['volume'] = {
                        'value': float(item.volume),
                        'unit': item.volume_unit
                    }

                if item.best_before is not None:
                    item_data['best_before'] = item.best_before.isoformat()

                not_picked_up_data.append(item_data)

            except Exception as e:
                return JsonResponse({
                    "error": f"Error processing not picked up item data: {str(e)}"
                }, status=500)

        response_data = {
            "page": page_number,
            "picked_up_items": {
                "total_pages": picked_up_paginator.num_pages,
                "total_items": picked_up_paginator.count,
                "items": picked_up_data
            },
            "not_picked_up_items": {
                "total_pages": not_picked_up_paginator.num_pages,
                "total_items": not_picked_up_paginator.count,
                "items": not_picked_up_data
            }
        }

        return JsonResponse(response_data, status=200)

    except Exception as e:
        return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

@token_required()
def get_organization_items(request):
    if request.user_type != 'organization':
        return JsonResponse({"error": "forbidden for samaritans"}, status=403)

    try:
        try:
            items_per_page = int(request.GET.get('items_per_page', os.getenv('ITEMS_PER_PAGE', 10)))
            if items_per_page <= 0:
                return JsonResponse({"error": "Items per page must be positive"}, status=400)
        except ValueError:
            return JsonResponse({"error": "Invalid items_per_page parameter"}, status=400)
        
        try:
            page_number = int(request.GET.get('page', 1))
            if page_number <= 0:
                return JsonResponse({"error": "Page number must be positive"}, status=400)
        except ValueError:
            return JsonResponse({"error": "Invalid page number"}, status=400)

        try:
            organization = Organization.objects.get(user__username=request.user.username)
        except Organization.DoesNotExist:
            return JsonResponse({"error": "Organization not found"}, status=404)

        try:
            category = request.GET.get('category')
            if category is not None:
                category = int(category)
                valid_categories = dict(Item.CATEGORY_CHOICES).keys()
                if category not in valid_categories:
                    return JsonResponse({
                        "error": "Invalid category",
                        "valid_categories": dict(Item.CATEGORY_CHOICES)
                    }, status=400)
        except ValueError:
            return JsonResponse({
                "error": "Category must be a number",
                "valid_categories": dict(Item.CATEGORY_CHOICES)
            }, status=400)

        reserved_items = Item.objects.filter(
            reserved_by=organization,
            is_picked_up=False
        ).order_by('-reserved_till')

        picked_up_items = Item.objects.filter(
            picked_up_by=organization,
            is_picked_up=True
        ).order_by('-scheduled_pickup_time')

        if category is not None:
            reserved_items = reserved_items.filter(category=category)
            picked_up_items = picked_up_items.filter(category=category)

        try:
            reserved_paginator = Paginator(reserved_items, items_per_page)
            picked_up_paginator = Paginator(picked_up_items, items_per_page)
            
            if (page_number > reserved_paginator.num_pages and reserved_paginator.num_pages > 0) or \
               (page_number > picked_up_paginator.num_pages and picked_up_paginator.num_pages > 0):
                return JsonResponse({"error": "Page number exceeds available pages"}, status=404)
            
            reserved_page = reserved_paginator.get_page(page_number)
            picked_up_page = picked_up_paginator.get_page(page_number)
        except Exception as e:
            return JsonResponse({"error": f"Pagination error: {str(e)}"}, status=500)

        reserved_data = []
        for item in reserved_page:
            try:
                item_data = {
                    'id': item.id,
                    'category': {
                        'id': item.category,
                        'name': dict(Item.CATEGORY_CHOICES)[item.category]
                    },
                    'description': item.description,
                    'pickup_location': {
                        'latitude': item.pickup_location.y,
                        'longitude': item.pickup_location.x
                    },
                    'posted_by': {
                        'id': item.posted_by.id,
                        'username': item.posted_by.user.username
                    },
                    'reserved_till': item.reserved_till.isoformat() if item.reserved_till else None
                }

                if item.weight is not None:
                    item_data['weight'] = {
                        'value': float(item.weight),
                        'unit': item.weight_unit
                    }

                if item.volume is not None:
                    item_data['volume'] = {
                        'value': float(item.volume),
                        'unit': item.volume_unit
                    }

                if item.best_before is not None:
                    item_data['best_before'] = item.best_before.isoformat()

                if hasattr(item, 'distance'):
                    item_data['distance_km'] = round(item.distance.km, 2)

                reserved_data.append(item_data)

            except Exception as e:
                return JsonResponse({
                    "error": f"Error processing reserved item data: {str(e)}"
                }, status=500)

        picked_up_data = []
        for item in picked_up_page:
            try:
                item_data = {
                    'id': item.id,
                    'category': {
                        'id': item.category,
                        'name': dict(Item.CATEGORY_CHOICES)[item.category]
                    },
                    'description': item.description,
                    'pickup_location': {
                        'latitude': item.pickup_location.y,
                        'longitude': item.pickup_location.x
                    },
                    'posted_by': {
                        'id': item.posted_by.id,
                        'username': item.posted_by.user.username
                    },
                    'scheduled_pickup_time': item.scheduled_pickup_time.isoformat() if item.scheduled_pickup_time else None
                }

                if item.weight is not None:
                    item_data['weight'] = {
                        'value': float(item.weight),
                        'unit': item.weight_unit
                    }

                if item.volume is not None:
                    item_data['volume'] = {
                        'value': float(item.volume),
                        'unit': item.volume_unit
                    }

                if item.best_before is not None:
                    item_data['best_before'] = item.best_before.isoformat()

                if hasattr(item, 'distance'):
                    item_data['distance_km'] = round(item.distance.km, 2)

                picked_up_data.append(item_data)

            except Exception as e:
                return JsonResponse({
                    "error": f"Error processing picked up item data: {str(e)}"
                }, status=500)

        response_data = {
            "page": page_number,
            "reserved_items": {
                "total_pages": reserved_paginator.num_pages,
                "total_items": reserved_paginator.count,
                "items": reserved_data
            },
            "picked_up_items": {
                "total_pages": picked_up_paginator.num_pages,
                "total_items": picked_up_paginator.count,
                "items": picked_up_data
            }
        }

        return JsonResponse(response_data, status=200)

    except Exception as e:
        return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)