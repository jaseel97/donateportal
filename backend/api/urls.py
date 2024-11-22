from django.urls import include, path

from . import views
from .views import ItemView

urlpatterns = [
    path("", views.index, name="index"),
    path('items', ItemView.as_view(), name='items'),

    # path('auth/signup', views.signup, name='signup'),
    # path('auth/login', views.login_view, name='login'),
    # path('auth/logout', views.logout_view, name='logout'),
    # path('auth/change-password', views.change_password, name='change_password'),
    # path('auth/profile', views.get_user_profile, name='user_profile'),
    # path('auth/request-reset-password/', views.request_password_reset, name='request_reset_password'),
    # path('auth/reset-password/', views.reset_password, name='reset_password'),
]
