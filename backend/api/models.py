from django.contrib.auth.models import AbstractUser, Group, Permission
from django.contrib.gis.db import models as gis_models
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_admin = models.BooleanField(default=False)
    
    # Override inherited fields to avoid conflicts
    groups = models.ManyToManyField(
        Group,
        related_name="custom_user_set",
        blank=True,
        help_text="The groups this user belongs to.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="custom_user_permissions",
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )
    
    def __str__(self):
        return self.email
    
    def get_templates(self):
        return self.templates.all()

class Organization(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    location = gis_models.PointField()

class Samaritan(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)

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
        User,
        on_delete=models.CASCADE,
        related_name="posted_items"
    )
    reserved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="reserved_items"
    )
    pickup_time = models.DateTimeField(blank=True, null=True)
    is_picked_up = models.BooleanField(default=False)