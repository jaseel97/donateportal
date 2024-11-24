from django.urls import include, path

from . import views
from .views import ItemView

urlpatterns = [
    path("", views.index, name="index"),
    path('items', ItemView.as_view(), name='items'),

    path('auth/organization/signup', views.signup_organization, name='signup_organization'),
    path('auth/samaritan/signup', views.signup_samaritan, name='signup_samaritan'),
    path('auth/login', views.login, name='login'),
    path('auth/logout', views.logout, name='logout'),
    # path('auth/change-password', views.change_password, name='change_password'),
    # path('auth/profile', views.get_user_profile, name='user_profile'),
    # path('auth/request-reset-password/', views.request_password_reset, name='request_reset_password'),
    # path('auth/reset-password/', views.reset_password, name='reset_password'),
]
