from django.urls import path
from . import views

urlpatterns = [
    path('place/<int:task_id>/', views.place_bid, name='place-bid'),
    path('my-bids/', views.my_bids, name='my-bids'),
    path('task/<int:task_id>/', views.task_bids, name='task-bids'),
    path('respond/<int:bid_id>/', views.respond_to_bid, name='respond-bid'),
]
