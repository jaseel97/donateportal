import re
from typing import Dict, List, Union, Tuple
from django.http import JsonResponse
from .models import Organization, Samaritan, User
from django.contrib.gis.geos import Point

def validate_coordinates(location_data):
    """
    Validate location coordinates.
    Returns (is_valid, error_message, (latitude, longitude))
    """
    if not isinstance(location_data, dict):
        return False, "Location must be a valid object"
    
    latitude = location_data.get('latitude')
    longitude = location_data.get('longitude')
    
    if latitude is None or longitude is None:
        return False, "Location must include both latitude and longitude"
        
    try:
        lat_float = float(latitude)
        long_float = float(longitude)
        
        if not (-90 <= lat_float <= 90):
            return False, "Latitude must be between -90 and 90"
            
        if not (-180 <= long_float <= 180):
            return False, "Longitude must be between -180 and 180"
            
        return True, None
        
    except (ValueError, TypeError):
        return False, "Invalid coordinate values - must be valid numbers"

def validate_postal_code(postal_code):
    """
    Validate Canadian postal code format.
    Returns (is_valid, error_message, formatted_postal_code)
    """
    if not postal_code:
        return False, "Postal code is required"
    
    if not re.match(r'^[A-Z]\d[A-Z]\s?\d[A-Z]\d$', postal_code.strip().upper()):
        return False, "Invalid postal code format. Must be in format A1A 1A1"
        
    return True, None

def validate_province(province):
    """
    Validate Canadian province code.
    Returns (is_valid, error_message, formatted_province)
    """
    if not province:
        return False, "Province is required"

    valid_provinces = {'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'}
    
    if province.strip().upper() not in valid_provinces:
        return False, "Invalid province code"
        
    return True, None

def validate_unique_user(email, username):
    """
    Validate that email and username are unique for Samaritan.
    Returns (is_valid, error_message)
    """
    try :
        if User.objects.filter(email=email).exists():
            return False, "A user with this email already exists"

        if User.objects.filter(username=username).exists():
            return False, "A user with this username already exists"
    except Exception as e:
        print("Error : ", str(e))
        return False, "Unknown Error"
        
    return True, None

#------------------------------------------------------------ Organization Validation ------------------------------------------------------------#

def validate_organization_required_fields(data):
    """
    Validate that all required fields are present and not empty.
    Returns (is_valid, list_of_missing_fields)
    """
    required_fields = {
        'username': data.get('username'),
        'password': data.get('password'),
        'email': data.get('email'),
        'location': data.get('location'),
        'name':data.get('name')
    }
    
    address_data = data.get('address', {})
    required_address_fields = {
        'address_line1': address_data.get('address_line1'),
        'city': address_data.get('city'),
        'province': address_data.get('province'),
        'postal_code': address_data.get('postal_code')
    }
    
    missing_fields = []
    
    # Check main fields
    for field, value in required_fields.items():
        if not value:
            missing_fields.append(field)
    
    # Check address fields
    for field, value in required_address_fields.items():
        if not value:
            missing_fields.append(field)
    
    return (len(missing_fields) == 0, missing_fields)

def validate_organization_data(data):
    """
    Main validation function that combines all validations.
    Returns (is_valid, error_message, cleaned_data)
    """
    # Check required fields
    fields_valid, missing_fields = validate_organization_required_fields(data)
    if not fields_valid:
        return False, f"Required fields missing: {', '.join(missing_fields)}"

    # Validate location coordinates
    coords_valid, coords_error = validate_coordinates(data.get('location', {}))
    if not coords_valid:
        return False, coords_error

    # Get address data
    address_data = data.get('address', {})
    
    # Validate postal code
    postal_valid, postal_error = validate_postal_code(
        address_data.get('postal_code', '')
    )
    if not postal_valid:
        return False, postal_error

    # Validate province
    province_valid, province_error = validate_province(
        address_data.get('province', '')
    )
    if not province_valid:
        return False, province_error

    # Validate unique user
    unique_valid, unique_error = validate_unique_user(
        data.get('email', ''), 
        data.get('username', '')
    )
    if not unique_valid:
        return False, unique_error

    return True, None

#------------------------------------------------------------ Samaritan Validation ------------------------------------------------------------#

def validate_samaritan_required_fields(data):
    """
    Validate that all required fields for Samaritan signup are present and not empty.
    Returns (is_valid, list_of_missing_fields)
    """
    required_fields = {
        'username': data.get('username'),
        'password': data.get('password'),
        'email': data.get('email'),
    }
    
    # Check address fields separately since they're nested
    address_data = data.get('address', {})
    required_address_fields = {
        'city': address_data.get('city'),
        'province': address_data.get('province')
    }
    
    missing_fields = []
    
    # Check main fields
    for field, value in required_fields.items():
        if not value:
            missing_fields.append(field)
    
    # Check address fields
    for field, value in required_address_fields.items():
        if not value:
            missing_fields.append(field)
    
    return (len(missing_fields) == 0, missing_fields)

def validate_samaritan_data(data):
    """
    Main validation function that combines all Samaritan validations.
    Returns (is_valid, error_message, cleaned_data)
    """
    # Check required fields
    fields_valid, missing_fields = validate_samaritan_required_fields(data)
    if not fields_valid:
        return False, f"Required fields missing: {', '.join(missing_fields)}"

    # Get address data
    address_data = data.get('address', {})
    
    # Validate province
    province_valid, province_error = validate_province(
        address_data.get('province', '')
    )
    if not province_valid:
        return False, province_error

    # Validate unique user
    unique_valid, unique_error = validate_unique_user(
        data.get('email', ''), 
        data.get('username', '')
    )
    if not unique_valid:
        return False, unique_error

    return True, None