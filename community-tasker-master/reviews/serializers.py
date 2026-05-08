from rest_framework import serializers
from .models import Review
from accounts.serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewee = UserSerializer(read_only=True)
    reviewee_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Review
        fields = [
            'id',
            'task',
            'reviewer',
            'reviewee',
            'reviewee_id',
            'rating',
            'comment',
            'created_at'
        ]
        read_only_fields = ['reviewer', 'created_at']