from django.db import models
from django.conf import settings


class Wallet(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallet'
    )
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    escrow_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.user.username}'s wallet (KSh {self.balance})"


class Transaction(models.Model):
    TOPUP = 'topup'
    ESCROW = 'escrow'
    RELEASE = 'release'
    REFUND = 'refund'

    TYPE_CHOICES = [
        (TOPUP, 'Top Up'),
        (ESCROW, 'Escrow Hold'),
        (RELEASE, 'Payment Released'),
        (REFUND, 'Refund'),
    ]

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    description = models.CharField(max_length=255)
    task = models.ForeignKey(
        'tasks.Task', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='transactions'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.wallet.user.username} | {self.transaction_type} | KSh {self.amount}"
