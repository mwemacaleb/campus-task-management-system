from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    POSTER = 'poster'
    TASKER = 'tasker'

    ROLE_CHOICES = [
        (POSTER, 'Poster'),
        (TASKER, 'Tasker'),
    ]

    VERIFICATION_NONE = 'none'
    VERIFICATION_PENDING = 'pending'
    VERIFICATION_APPROVED = 'approved'
    VERIFICATION_REJECTED = 'rejected'

    VERIFICATION_STATUS_CHOICES = [
        (VERIFICATION_NONE, 'Not Submitted'),
        (VERIFICATION_PENDING, 'Pending Review'),
        (VERIFICATION_APPROVED, 'Approved'),
        (VERIFICATION_REJECTED, 'Rejected'),
    ]

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default=POSTER,
    )
    is_verified = models.BooleanField(default=False)
    student_id = models.CharField(max_length=50, blank=True)
    bio = models.TextField(blank=True)
    verification_status = models.CharField(
        max_length=10,
        choices=VERIFICATION_STATUS_CHOICES,
        default=VERIFICATION_NONE,
    )
    verification_email = models.EmailField(blank=True)
    # Poster identity verification
    phone = models.CharField(max_length=20, blank=True)
    id_number = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
