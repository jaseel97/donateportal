from datetime import date, datetime, timezone
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
from django.db import transaction
from django.conf import settings

from api.jwt import generate_jwt_token, token_required
from api.validation import validate_category, validate_coordinates, validate_organization_data, validate_samaritan_data
from api.tasks import make_inactive

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

        # Ensure location and address fields exist
        location_data = data.get('location')
        if not location_data:
            return JsonResponse({'error': 'Location data is missing'}, status=400)
        
        # Validate latitude and longitude
        try:
            latitude = float(location_data['latitude'])
            longitude = float(location_data['longitude'])
        except (ValueError, KeyError):
            return JsonResponse({'error': 'Invalid or missing latitude/longitude values'}, status=400)

        # Ensure address data exists
        address_data = data.get('address')
        if not address_data:
            return JsonResponse({'error': 'Address data is missing'}, status=400)

        # Flatten the address and location data
        point = Point(longitude, latitude)

        user_data = {
            'username': data.get('username'),
            'email': data.get('email'),
            'password': data.get('password'),
            'is_staff': False
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
        #
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

            if specific_user.user_type in ['Organization', 'organization']:
                token_payload['latitude'] = specific_user.location.y,
                token_payload['longitude'] = specific_user.location.x

            token = generate_jwt_token(token_payload)
            print("JWT token sent:", token)
            
            response = JsonResponse({
                'message': 'Login successful',
                'user_type': specific_user.user_type,
            })
            
            response.set_cookie(
                key='jwt',
                value=token,
                httponly=False,
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
def save_item_image(item, image_file):
    _, ext = os.path.splitext(image_file.name)
    filename = f'item_{item.id}{ext}'
    relative_path = os.path.join('item_images', filename)
    full_path = os.path.join(settings.MEDIA_ROOT, 'item_images', filename)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'wb+') as destination:
        for chunk in image_file.chunks():
            destination.write(chunk)
            
    return relative_path

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
            data = json.loads(request.POST.get('data', '{}'))
        except json.JSONDecodeError:
            return JsonResponse({
                "error": "Invalid JSON format in data field"
            }, status=400)
                

        image_file = request.FILES.get('image')
        
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

        pickup_window_start = data.get('pickup_window_start')
        pickup_window_end = data.get('pickup_window_end')
        
        if pickup_window_start:
            try:
                pickup_window_start = datetime.strptime(pickup_window_start, '%H:%M').time()
            except ValueError:
                return JsonResponse({
                    "error": "Invalid pickup_window_start format. Use HH:MM"
                }, status=400)
                
        if pickup_window_end:
            try:
                pickup_window_end = datetime.strptime(pickup_window_end, '%H:%M').time()
            except ValueError:
                return JsonResponse({
                    "error": "Invalid pickup_window_end format. Use HH:MM"
                }, status=400)
                
        if pickup_window_start and pickup_window_end and pickup_window_start >= pickup_window_end:
            return JsonResponse({
                "error": "Pickup window end time must be after start time"
            }, status=400)

        available_till = data.get('available_till')
        if available_till:
            try:
                available_till = datetime.strptime(available_till, '%Y-%m-%dT%H:%M:%S%z')
                if available_till < datetime.now(timezone.utc):
                    return JsonResponse({
                        "error": "Available till date cannot be in the past"
                    }, status=400)
            except ValueError:
                return JsonResponse({
                    "error": "Invalid available_till format. Use ISO format with timezone"
                }, status=400)
        
        try:
            samaritan = Samaritan.objects.get(username=request.username)
        except Samaritan.DoesNotExist:
            return JsonResponse({
                "error": "Samaritan not found"
            }, status=404)
        

        item = Item.objects.create(
            category=category,
            description=data['description'],
            pickup_location=pickup_location,
            posted_by=samaritan,
            weight=weight if weight is not None else None,
            weight_unit=data.get('weight_unit'),
            volume=volume if volume is not None else None,
            volume_unit=data.get('volume_unit'),
            best_before=best_before if best_before else None,
            pickup_window_start=pickup_window_start if pickup_window_start else None,
            pickup_window_end=pickup_window_end if pickup_window_end else None,
            available_till=available_till if available_till else None
        )

        if image_file:
            try:
                relative_path = save_item_image(item, image_file)
                item.image = relative_path
                item.save()
            except Exception as e:
                item.delete()
                return JsonResponse({
                    "error": f"Failed to save image: {str(e)}"
                }, status=500)

        if item.available_till:
            make_inactive.apply_async(
                (item.id,), 
                countdown=(item.available_till-datetime.now(timezone.utc)).total_seconds()
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
                "pickup_window_start": item.pickup_window_start.strftime('%H:%M') if item.pickup_window_start else None,
                "pickup_window_end": item.pickup_window_end.strftime('%H:%M') if item.pickup_window_end else None,
                "available_till": item.available_till.isoformat() if item.available_till else None,
                "is_active": item.is_active,
                "is_reserved": item.is_reserved,
                "is_picked_up": item.is_picked_up,
                "created_at": item.created_at.isoformat() if hasattr(item, 'created_at') else None,
                "image_url": item.image.url if item.image else None
            }
        }, status=201)
        
    except Exception as e:
        return JsonResponse({
            "error": f"Internal server error: {str(e)}"
        }, status=500)
    
@csrf_exempt
@token_required()
def browse_item_listings(request):
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
            radius_km = float(request.GET.get('radius', os.getenv('DEFAULT_RADIUS', 100)))
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
        
        # active, unreserved, not picked up items
        queryset = Item.objects.filter(
            pickup_location__distance_lte=(organization.location, D(m=radius_m)),
            is_active=True,
            is_reserved=False,
            is_picked_up=False
        )

        for item in queryset:
            for field in item._meta.fields:
                print(f"{field.name}: {getattr(item, field.name)}")
            print("-" * 20)
        if category is not None and category != 0:
            queryset = queryset.filter(category=category)
        
        try:
            queryset = queryset.filter(pickup_location__distance_lte=(organization.location, D(m=radius_m)))

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
                    },
                    'pickup_window_start': item.pickup_window_start.strftime('%H:%M') if item.pickup_window_start else None,
                    'pickup_window_end': item.pickup_window_end.strftime('%H:%M') if item.pickup_window_end else None,
                    'available_till': item.available_till.isoformat() if item.available_till else None,
                    'image_url': item.image.url if item.image else None
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

@csrf_exempt
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
            samaritan = Samaritan.objects.get(username=username)
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
        if category is not None and category != 0:
            all_items = all_items.filter(category=category)

        active_items = all_items.filter(is_active=True).order_by('-created_at')
        inactive_items = all_items.filter(is_active=False).order_by('-created_at')

        try:
            active_paginator = Paginator(active_items, items_per_page)
            inactive_paginator = Paginator(inactive_items, items_per_page)
            
            if  (page_number > active_paginator.num_pages and active_paginator.num_pages > 0) or \
                (page_number > inactive_paginator.num_pages and inactive_paginator.num_pages > 0):
                return JsonResponse({"error": "Page number exceeds available pages"}, status=404)
            
            active_page = active_paginator.get_page(page_number)
            inactive_page = inactive_paginator.get_page(page_number)
        except Exception as e:
            return JsonResponse({"error": f"Pagination error: {str(e)}"}, status=500)

        def serialize_item(item):
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
                    'is_active': item.is_active,
                    'is_reserved': item.is_reserved,
                    'is_picked_up': item.is_picked_up,
                    'reserved_by': {
                        'id': item.reserved_by.id,
                        'name': item.reserved_by.name
                    } if item.reserved_by else None,
                    'picked_up_by': {
                        'id': item.picked_up_by.id,
                        'name': item.picked_up_by.name
                    } if item.picked_up_by else None,
                    'pickup_window_start': item.pickup_window_start.strftime('%H:%M') if item.pickup_window_start else None,
                    'pickup_window_end': item.pickup_window_end.strftime('%H:%M') if item.pickup_window_end else None,
                    'available_till': item.available_till.isoformat() if item.available_till else None,
                    'image_url': item.image.url if item.image else None
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

                return item_data

            except Exception as e:
                raise Exception(f"Error processing item data: {str(e)}")

        active_data = []
        inactive_data = []

        for item in active_page:
            active_data.append(serialize_item(item))

        for item in inactive_page:
            inactive_data.append(serialize_item(item))

        response_data = {
            "page": page_number,
            "active_items": {
                "total_pages": active_paginator.num_pages,
                "total_items": active_paginator.count,
                "items": active_data
            },
            "inactive_items": {
                "total_pages": inactive_paginator.num_pages,
                "total_items": inactive_paginator.count,
                "items": inactive_data
            }
        }

        return JsonResponse(response_data, status=200)

    except Exception as e:
        return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

@token_required()
def get_organization_items(request, username):
    if request.user_type != 'organization':
        return JsonResponse({'error': 'forbidden for samaritans'}, status=403)

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
            organization = Organization.objects.get(username=username)
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

        # Query for reserved but not picked up items
        reserved_items = Item.objects.filter(
            reserved_by=organization,
            is_reserved=True,
            is_picked_up=False
        ).order_by('-available_till')

        # Query for picked up items
        picked_up_items = Item.objects.filter(
            picked_up_by=organization,
            is_picked_up=True
        ).order_by('-available_till')

        if category is not None and category != 0:
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

        def serialize_item(item):
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
                    'username': item.posted_by.username
                },
                'is_active': item.is_active,
                'is_reserved': item.is_reserved,
                'is_picked_up': item.is_picked_up,
                'pickup_window_start': item.pickup_window_start.strftime('%H:%M') if item.pickup_window_start else None,
                'pickup_window_end': item.pickup_window_end.strftime('%H:%M') if item.pickup_window_end else None,
                'available_till': item.available_till.isoformat() if item.available_till else None,
                'image_url': item.image.url if item.image else None
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

            return item_data

        response_data = {
            "page": page_number,
            "reserved_items": {
                "total_pages": reserved_paginator.num_pages,
                "total_items": reserved_paginator.count,
                "items": [serialize_item(item) for item in reserved_page]
            },
            "picked_up_items": {
                "total_pages": picked_up_paginator.num_pages,
                "total_items": picked_up_paginator.count,
                "items": [serialize_item(item) for item in picked_up_page]
            }
        }

        return JsonResponse(response_data, status=200)

    except Exception as e:
        return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

@csrf_exempt
@token_required()
def reserve_item(request, item_id):
    """
    Allow an organization to reserve an available item.
    """
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    if request.user_type != 'organization':
        return JsonResponse({"error": "Only organizations can reserve items"}, status=403)
        
    try:
        with transaction.atomic():
            try:
                organization = Organization.objects.get(username=request.username)
            except Organization.DoesNotExist:
                return JsonResponse({"error": "Organization not found"}, status=404)
            
            try:
                item = Item.objects.select_for_update().get(id=item_id)
            except Item.DoesNotExist:
                return JsonResponse({"error": "Item not found"}, status=404)
            
            if not item.is_active:
                return JsonResponse({"error": "Item is not active"}, status=400)
                
            if item.is_reserved:
                return JsonResponse({"error": "Item is already reserved"}, status=400)
                
            if item.is_picked_up:
                return JsonResponse({"error": "Item is already picked up"}, status=400)
                
            if item.available_till and item.available_till <= datetime.now(timezone.utc):
                return JsonResponse({"error": "Item is no longer available"}, status=400)
            
            item.is_reserved = True
            item.reserved_by = organization
            item.save(update_fields=['is_reserved', 'reserved_by'])
            
            return JsonResponse({
                "message": "Item reserved successfully",
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
                    "is_active": item.is_active,
                    "is_reserved": item.is_reserved,
                    "is_picked_up": item.is_picked_up,
                    "reserved_by": {
                        "id": organization.id,
                        "username": organization.username
                    },
                    "pickup_window_start": item.pickup_window_start.strftime('%H:%M') if item.pickup_window_start else None,
                    "pickup_window_end": item.pickup_window_end.strftime('%H:%M') if item.pickup_window_end else None,
                    "available_till": item.available_till.isoformat() if item.available_till else None,
                    'image_url': item.image.url if item.image else None
                }
            }, status=200)
            
    except Exception as e:
        return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

@csrf_exempt
@token_required()
def unreserve_item(request, item_id):
    """
    Allow an organization to cancel their reservation of an item.
    Only the organization that reserved the item can cancel the reservation.
    """
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    if request.user_type != 'organization':
        return JsonResponse({"error": "Only organizations can cancel reservations"}, status=403)
        
    try:
        with transaction.atomic():
            # Get and lock the item for update
            try:
                item = Item.objects.select_for_update().get(id=item_id)
            except Item.DoesNotExist:
                return JsonResponse({"error": "Item not found"}, status=404)
            
            # Validate item state
            if not item.is_active:
                return JsonResponse({"error": "Item is not active"}, status=400)
                
            if not item.is_reserved:
                return JsonResponse({"error": "Item is not reserved"}, status=400)
                
            if item.is_picked_up:
                return JsonResponse({"error": "Cannot unreserve an item that has been picked up"}, status=400)

            try:
                organization = Organization.objects.get(username=request.username)
                # Check if this organization is the one that reserved it
                if item.reserved_by != organization:
                    return JsonResponse({
                        "error": "Only the organization that reserved this item can cancel the reservation"
                    }, status=403)
            except Organization.DoesNotExist:
                return JsonResponse({"error": "Organization not found"}, status=404)
            
            # Clear the reservation
            item.is_reserved = False
            item.reserved_by = None
            item.save(update_fields=['is_reserved', 'reserved_by'])
            
            return JsonResponse({
                "message": "Reservation cancelled successfully",
                "item": {
                    "id": item.id,
                    "category": {
                        "id": item.category,
                        "name": dict(Item.CATEGORY_CHOICES)[item.category]
                    },
                    "description": item.description,
                    "is_active": item.is_active,
                    "is_reserved": item.is_reserved,
                    "is_picked_up": item.is_picked_up,
                    "reserved_by": None,
                    'image_url': item.image.url if item.image else None
                }
            }, status=200)
            
    except Exception as e:
        return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

@csrf_exempt
@token_required()
def pickup_item(request, item_id):
    """
    Allow either the organization that reserved the item or the samaritan to mark an item as picked up.
    The item can only be marked as picked up by the organization that reserved it.
    """
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    if request.user_type not in ['organization', 'samaritan']:
        return JsonResponse({"error": "Invalid user type"}, status=403)
        
    try:
        with transaction.atomic():
            # Get and lock the item for update
            try:
                item = Item.objects.select_for_update().get(id=item_id)
            except Item.DoesNotExist:
                return JsonResponse({"error": "Item not found"}, status=404)
            
            # Validate item state
            if not item.is_active:
                return JsonResponse({"error": "Item is not active"}, status=400)
                
            if not item.is_reserved:
                return JsonResponse({"error": "Item is not reserved"}, status=400)
                
            if item.is_picked_up:
                return JsonResponse({"error": "Item is already marked as picked up"}, status=400)

            # Check permissions based on user type
            if request.user_type == 'organization':
                try:
                    organization = Organization.objects.get(username=request.username)
                    # Check if this organization is the one that reserved it
                    if item.reserved_by != organization:
                        return JsonResponse({
                            "error": "Only the organization that reserved this item can mark it as picked up"
                        }, status=403)
                except Organization.DoesNotExist:
                    return JsonResponse({"error": "Organization not found"}, status=404)
            else:  # samaritan
                try:
                    samaritan = Samaritan.objects.get(username=request.username)
                    if item.posted_by != samaritan:
                        return JsonResponse({"error": "Not authorized to mark this item as picked up"}, status=403)
                except Samaritan.DoesNotExist:
                    return JsonResponse({"error": "Samaritan not found"}, status=404)
            
            # Mark as picked up - automatically set picked_up_by to the reserving organization
            item.is_picked_up = True
            item.picked_up_by = item.reserved_by
            # item.picked_up_at = datetime.now(timezone.utc)
            item.save(update_fields=['is_picked_up', 'picked_up_by']) #'picked_up_at'
            
            return JsonResponse({
                "message": "Item marked as picked up successfully",
                "item": {
                    "id": item.id,
                    "category": {
                        "id": item.category,
                        "name": dict(Item.CATEGORY_CHOICES)[item.category]
                    },
                    "description": item.description,
                    "is_active": item.is_active,
                    "is_reserved": item.is_reserved,
                    "is_picked_up": item.is_picked_up,
                    "reserved_by": {
                        "id": item.reserved_by.id,
                        "username": item.reserved_by.username
                    },
                    "picked_up_by": {
                        "id": item.picked_up_by.id,
                        "username": item.picked_up_by.username
                    },
                    'image_url': item.image.url if item.image else None
                    # "picked_up_at": item.picked_up_at.isoformat()
                }
            }, status=200)
            
    except Exception as e:
        return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)