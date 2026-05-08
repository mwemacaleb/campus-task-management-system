from django.db import models
from django.conf import settings


class Task(models.Model):
    TECH = 'tech'
    CLEANING = 'cleaning'
    ERRANDS = 'errands'
    TUTORING = 'tutoring'
    MOVING = 'moving'

    CATEGORY_CHOICES = [
        (TECH, 'Tech'),
        (CLEANING, 'Cleaning'),
        (ERRANDS, 'Errands'),
        (TUTORING, 'Tutoring'),
        (MOVING, 'Moving'),
    ]

    OPEN = 'open'
    ASSIGNED = 'assigned'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (OPEN, 'Open'),
        (ASSIGNED, 'Assigned'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    ]

    poster = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posted_tasks'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default=TECH
    )
    location = models.CharField(max_length=200)
    budget = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=OPEN
    )
    assigned_tasker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.status})"