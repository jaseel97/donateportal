from django.db import models
from django.contrib.auth.models import User
from django.contrib.gis.db import models as gis_models

class Organization(User):
    name = models.CharField()
    location = gis_models.PointField()

class Samaritan(User):
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    pass

class Item(models.Model):
    category_enum = [
        [0,'Food'],
        [1, 'Clothes'],
        [2, 'Books'],
        [3, 'Furniture'],
        [4, 'Household Items'],
        [5, 'Electronics'],
        [6, 'Toys'],
        [7, 'Medical Supplies'],
        [8, 'Pet Supplies'],
        [9, 'Others'],
    ]

    category = models.CharField(choices=category_enum)
    description = models.TextField()
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    weight_unit = models.CharField(blank=True, null=True)
    volume = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    volume_unit = models.CharField(blank=True, null=True)
    best_before = models.DateField(blank=True, null=True)
    pickup_location = gis_models.PointField()
    reserved_till = models.DateTimeField(blank=True, null=True)
    posted_by = models.ForeignKey(
        Samaritan,
        on_delete=models.CASCADE,
        related_name="posted_items"
    )
    reserved_by = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="reserved_items"
    )
    pickup_time = models.DateTimeField(blank=True, null=True)
    is_picked_up = models.BooleanField(default=False)