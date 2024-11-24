from django.contrib import admin
from .models import Item, Organization, Samaritan

admin.site.register(Organization)
admin.site.register(Samaritan)
admin.site.register(Item)