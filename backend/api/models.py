import re

from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.contrib.gis.db import models as gis_models

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('organization', 'Organization'),
        ('samaritan', 'Samaritan'),
    )
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='samaritan')
    
    # Override the ManyToMany relationships with custom related_names
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        related_name='custom_user_set',
        help_text='The groups this user belongs to.'
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        related_name='custom_user_set',
        help_text='Specific permissions for this user.'
    )

    def save(self, *args, **kwargs):
        if not self.pk:
            if isinstance(self, Organization):
                self.user_type = 'organization'
            elif isinstance(self, Samaritan):
                self.user_type = 'samaritan'
        super().save(*args, **kwargs)

class Organization(User):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, parent_link=True)
    name = models.TextField()
    location = gis_models.PointField()
    
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    province = models.CharField(max_length=2, blank=True, null=True)
    postal_code = models.CharField(max_length=7, blank=True, null=True)

class Samaritan(User):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, parent_link=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    city = models.CharField(max_length=100, blank=True, null=True)
    province = models.CharField(max_length=2, blank=True, null=True)

class Item(models.Model):
    CATEGORY_CHOICES = [
        (0, 'Food'),
        (1, 'Clothes'),
        (2, 'Books'),
        (3, 'Furniture'),
        (4, 'Household Items'),
        (5, 'Electronics'),
        (6, 'Toys'),
        (7, 'Medical Supplies'),
        (8, 'Pet Supplies'),
        (9, 'Others'),
    ]
    
    category = models.IntegerField(choices=CATEGORY_CHOICES)
    description = models.TextField()
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    weight_unit = models.CharField(max_length=50, blank=True, null=True)
    volume = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    volume_unit = models.CharField(max_length=50, blank=True, null=True)
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