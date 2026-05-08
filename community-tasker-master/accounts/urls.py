from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('profile/', views.profile, name='profile'),
    path('profile/update/', views.update_profile, name='profile-update'),
    path('profile/stats/', views.profile_stats, name='profile-stats'),
    path('verify/', views.verify_student, name='verify'),
    path('verify-poster/', views.verify_poster, name='verify-poster'),
]
