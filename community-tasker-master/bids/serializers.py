from rest_framework import serializers
from .models import Bid
from accounts.serializers import UserSerializer


class BidSerializer(serializers.ModelSerializer):
    tasker = UserSerializer(read_only=True)
    task_title = serializers.CharField(
        source='task.title',
        read_only=True
    )

    class Meta:
        model = Bid
        fields = [
            'id',
            'task',
            'task_title',
            'tasker',
            'proposed_price',
            'message',
            'status',
            'created_at'
        ]
        read_only_fields = ['tasker', 'status', 'created_at' , 'task']