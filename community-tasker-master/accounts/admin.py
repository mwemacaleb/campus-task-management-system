from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User


def approve_verification(modeladmin, request, queryset):
    updated = queryset.filter(
        role=User.TASKER,
        verification_status=User.VERIFICATION_PENDING
    ).update(
        verification_status=User.VERIFICATION_APPROVED,
        is_verified=True
    )
    modeladmin.message_user(request, f"{updated} student(s) approved successfully.")

approve_verification.short_description = "✅ Approve selected verification requests"


def reject_verification(modeladmin, request, queryset):
    updated = queryset.filter(
        role=User.TASKER,
        verification_status=User.VERIFICATION_PENDING
    ).update(
        verification_status=User.VERIFICATION_REJECTED,
        is_verified=False
    )
    modeladmin.message_user(request, f"{updated} student(s) rejected.")

reject_verification.short_description = "❌ Reject selected verification requests"


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = [
        'username', 'email', 'role',
        'verification_status_badge', 'verification_email',
        'is_verified', 'date_joined'
    ]
    list_filter = ['role', 'is_verified', 'verification_status']
    search_fields = ['username', 'email', 'verification_email']
    actions = [approve_verification, reject_verification]
    ordering = ['-date_joined']

    fieldsets = UserAdmin.fieldsets + (
        ('Community Tasker Info', {
            'fields': ('role', 'is_verified', 'student_id', 'bio')
        }),
        ('Student Verification', {
            'fields': ('verification_status', 'verification_email'),
        }),
        ('Resident Verification', {
            'fields': ('phone', 'id_number'),
        }),
    )

    def verification_status_badge(self, obj):
        colors = {
            'none': '#94a3b8',
            'pending': '#f59e0b',
            'approved': '#22c55e',
            'rejected': '#ef4444',
        }
        labels = {
            'none': 'Not Submitted',
            'pending': '⏳ Pending',
            'approved': '✅ Approved',
            'rejected': '❌ Rejected',
        }
        color = colors.get(obj.verification_status, '#94a3b8')
        label = labels.get(obj.verification_status, obj.verification_status)
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, label
        )

    verification_status_badge.short_description = 'Verification Status'
