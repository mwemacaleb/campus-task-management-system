from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Count, Sum
from .models import Task
from .serializers import TaskSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def task_list(request):
    tasks = Task.objects.all().order_by('-created_at')
    category = request.query_params.get('category')
    if category:
        tasks = tasks.filter(category=category)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def task_detail(request, pk):
    try:
        task = Task.objects.get(pk=pk)
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    serializer = TaskSerializer(task)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def task_create(request):
    if request.user.role != 'poster':
        return Response(
            {'error': 'Only posters can create tasks'},
            status=status.HTTP_403_FORBIDDEN
        )
    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(poster=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_tasks(request):
    tasks = Task.objects.filter(
        poster=request.user
    ).order_by('-created_at')
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_earnings(request):
    tasks = Task.objects.filter(
        assigned_tasker=request.user,
        status='completed'
    ).order_by('-created_at')
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def task_update_status(request, pk):
    try:
        task = Task.objects.get(pk=pk, poster=request.user)
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    new_status = request.data.get('status')
    if new_status not in ['open', 'assigned', 'completed', 'cancelled']:
        return Response(
            {'error': 'Invalid status'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if new_status == 'completed' and task.assigned_tasker:
        from payments.models import Wallet, Transaction
        budget = task.budget

        # Release from poster escrow
        poster_wallet, _ = Wallet.objects.get_or_create(user=task.poster)
        poster_wallet.escrow_balance = max(0, poster_wallet.escrow_balance - budget)
        poster_wallet.save()
        Transaction.objects.create(
            wallet=poster_wallet,
            amount=budget,
            transaction_type=Transaction.RELEASE,
            description=f'Payment released for: {task.title}',
            task=task,
        )

        # Credit tasker wallet
        tasker_wallet, _ = Wallet.objects.get_or_create(user=task.assigned_tasker)
        tasker_wallet.balance += budget
        tasker_wallet.save()
        Transaction.objects.create(
            wallet=tasker_wallet,
            amount=budget,
            transaction_type=Transaction.RELEASE,
            description=f'Earned for completing: {task.title}',
            task=task,
        )

    task.status = new_status
    task.save()
    return Response(TaskSerializer(task).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def task_stats(request):
    from accounts.models import User
    from bids.models import Bid
    from reviews.models import Review

    total_tasks = Task.objects.count()
    total_users = User.objects.count()
    total_taskers = User.objects.filter(role='tasker').count()
    total_posters = User.objects.filter(role='poster').count()
    total_bids = Bid.objects.count()
    total_reviews = Review.objects.count()
    completed_tasks = Task.objects.filter(status='completed').count()

    by_category = list(
        Task.objects.values('category').annotate(count=Count('id')).order_by('category')
    )

    by_status = list(
        Task.objects.values('status').annotate(count=Count('id')).order_by('status')
    )

    total_value = Task.objects.filter(status='completed').aggregate(
        total=Sum('budget')
    )['total'] or 0

    return Response({
        'total_tasks': total_tasks,
        'total_users': total_users,
        'total_taskers': total_taskers,
        'total_posters': total_posters,
        'total_bids': total_bids,
        'total_reviews': total_reviews,
        'completed_tasks': completed_tasks,
        'total_value': float(total_value),
        'by_category': by_category,
        'by_status': by_status,
    })
