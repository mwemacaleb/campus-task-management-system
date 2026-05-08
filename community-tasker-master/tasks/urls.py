from django.urls import path
from . import views

urlpatterns = [
    path('', views.task_list, name='task-list'),
    path('create/', views.task_create, name='task-create'),
    path('my-tasks/', views.my_tasks, name='my-tasks'),
    path('my-earnings/', views.my_earnings, name='my-earnings'),
    path('stats/', views.task_stats, name='task-stats'),
    path('<int:pk>/', views.task_detail, name='task-detail'),
    path('<int:pk>/status/', views.task_update_status, name='task-status'),
]
