import os
import json

from django.contrib.gis.geos import Point
from django.contrib.gis.measure import Distance
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views import View

from api.models import Organization, Item


def index(request):
    return JsonResponse({'msg': 'API is running'}, status=200)


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