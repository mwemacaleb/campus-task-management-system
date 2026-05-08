from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_review, name='create-review'),
    path('user/<int:user_id>/', views.user_reviews, name='user-reviews'),
]