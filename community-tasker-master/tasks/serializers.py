from rest_framework import serializers
from .models import Task
from accounts.serializers import UserSerializer


class TaskSerializer(serializers.ModelSerializer):
    poster = UserSerializer(read_only=True)
    bid_count = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'category',
            'location',
            'budget',
            'status',
            'poster',
            'assigned_tasker',
            'created_at',
            'deadline',
            'bid_count'
        ]
        read_only_fields = ['poster', 'created_at']

    def get_bid_count(self, obj):
        try:
            return obj.bids.count()
        except Exception:
            return 0