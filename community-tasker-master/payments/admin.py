from django.contrib import admin
from .models import Wallet, Transaction


class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0
    readonly_fields = ['amount', 'transaction_type', 'description', 'task', 'created_at']
    can_delete = False


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance', 'escrow_balance']
    search_fields = ['user__username', 'user__email']
    inlines = [TransactionInline]


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['wallet', 'transaction_type', 'amount', 'description', 'created_at']
    list_filter = ['transaction_type']
    search_fields = ['wallet__user__username', 'description']
