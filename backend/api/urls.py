from django.urls import include, path

from . import views
from .views import ItemView

urlpatterns = [
    path("", views.index, name="index"),
    path('items', ItemView.as_view(), name='items')
]
