from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer
from tasks.models import Task
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request):
    task_id = request.data.get('task')
    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    if task.status != 'completed':
        return Response(
            {'error': 'Can only review completed tasks'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if Review.objects.filter(task=task, reviewer=request.user).exists():
        return Response(
            {'error': 'You have already reviewed this task'},
            status=status.HTTP_400_BAD_REQUEST
        )
    reviewee_id = request.data.get('reviewee_id')
    try:
        reviewee = User.objects.get(pk=reviewee_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(
            reviewer=request.user,
            reviewee=reviewee
        )
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_reviews(request, user_id):
    reviews = Review.objects.filter(
        reviewee_id=user_id
    ).order_by('-created_at')
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)