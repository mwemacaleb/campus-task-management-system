from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Bid
from .serializers import BidSerializer
from tasks.models import Task


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_bid(request, task_id):
    if request.user.role != 'tasker':
        return Response(
            {'error': 'Only taskers can place bids'},
            status=status.HTTP_403_FORBIDDEN
        )
    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    if task.status != 'open':
        return Response(
            {'error': 'Task is not open for bids'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if task.poster == request.user:
        return Response(
            {'error': 'You cannot bid on your own task'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if Bid.objects.filter(task=task, tasker=request.user).exists():
        return Response(
            {'error': 'You have already bid on this task'},
            status=status.HTTP_400_BAD_REQUEST
        )
    serializer = BidSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(task=task, tasker=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_bids(request):
    bids = Bid.objects.filter(
        tasker=request.user
    ).order_by('-created_at')
    serializer = BidSerializer(bids, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_bids(request, task_id):
    try:
        task = Task.objects.get(pk=task_id, poster=request.user)
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    bids = Bid.objects.filter(task=task).order_by('-created_at')
    serializer = BidSerializer(bids, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def respond_to_bid(request, bid_id):
    try:
        bid = Bid.objects.get(
            pk=bid_id,
            task__poster=request.user
        )
    except Bid.DoesNotExist:
        return Response(
            {'error': 'Bid not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    new_status = request.data.get('status')
    if new_status not in ['accepted', 'rejected']:
        return Response(
            {'error': 'Invalid status'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if new_status == 'accepted':
        from payments.models import Wallet, Transaction
        poster_wallet, _ = Wallet.objects.get_or_create(user=request.user)
        budget = bid.task.budget

        if poster_wallet.balance < budget:
            return Response(
                {'error': f'Insufficient wallet balance. You need KSh {budget:,.0f} but have KSh {poster_wallet.balance:,.0f}. Please top up your wallet.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Move budget into escrow
        poster_wallet.balance -= budget
        poster_wallet.escrow_balance += budget
        poster_wallet.save()

        Transaction.objects.create(
            wallet=poster_wallet,
            amount=budget,
            transaction_type=Transaction.ESCROW,
            description=f'Escrow held for: {bid.task.title}',
            task=bid.task,
        )

        bid.task.status = 'assigned'
        bid.task.assigned_tasker = bid.tasker
        bid.task.save()
        Bid.objects.filter(task=bid.task).exclude(pk=bid.pk).update(status='rejected')

    bid.status = new_status
    bid.save()
    return Response(BidSerializer(bid).data)