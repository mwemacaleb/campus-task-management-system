from django.contrib import admin
from .models import Bid

@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ['tasker', 'task', 'proposed_price', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['tasker__username', 'task__title']