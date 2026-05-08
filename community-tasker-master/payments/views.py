from decimal import Decimal
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Wallet, Transaction
from .serializers import WalletSerializer


def get_or_create_wallet(user):
    wallet, _ = Wallet.objects.get_or_create(user=user)
    return wallet


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_detail(request):
    wallet = get_or_create_wallet(request.user)
    serializer = WalletSerializer(wallet)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def top_up(request):
    try:
        amount = Decimal(str(request.data.get('amount', 0)))
    except Exception:
        return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

    if amount <= 0:
        return Response({'error': 'Amount must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)

    if amount > 100000:
        return Response({'error': 'Maximum top-up is KSh 100,000'}, status=status.HTTP_400_BAD_REQUEST)

    wallet = get_or_create_wallet(request.user)
    wallet.balance += amount
    wallet.save()

    Transaction.objects.create(
        wallet=wallet,
        amount=amount,
        transaction_type=Transaction.TOPUP,
        description=f'Wallet top-up of KSh {amount:,.0f}',
    )

    return Response({
        'message': f'KSh {amount:,.0f} added to your wallet',
        'balance': float(wallet.balance),
        'escrow_balance': float(wallet.escrow_balance),
    })
