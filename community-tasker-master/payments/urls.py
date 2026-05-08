from django.urls import path
from . import views

urlpatterns = [
    path('wallet/', views.wallet_detail, name='wallet'),
    path('topup/', views.top_up, name='topup'),
]
