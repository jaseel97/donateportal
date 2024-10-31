from django.db import models
from django.contrib.auth.models import User

class Organization(User):
    pass

class Samaritan(User):
    pass

class Item(models.Model):
    pass
