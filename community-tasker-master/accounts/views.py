from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import User
from .serializers import RegisterSerializer, UserSerializer

ALLOWED_EDU_DOMAINS = ('.edu', '.ac.ke', '.ac.ug', '.ac.tz', '.ac.za')


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    identifier = request.data.get('username')
    password = request.data.get('password')

    # Try direct username auth first, then fall back to email lookup
    user = authenticate(username=identifier, password=password)
    if not user:
        try:
            user_obj = User.objects.get(email=identifier)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass

    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    return Response(
        {'error': 'Invalid credentials'},
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response(UserSerializer(request.user).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    new_username = request.data.get('username', user.username).strip()
    new_bio = request.data.get('bio', user.bio).strip()

    if new_username != user.username:
        if User.objects.filter(username=new_username).exclude(pk=user.pk).exists():
            return Response(
                {'error': 'That username is already taken'},
                status=status.HTTP_400_BAD_REQUEST
            )

    user.username = new_username
    user.bio = new_bio
    user.save()
    return Response(UserSerializer(user).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_stats(request):
    from django.db.models import Sum
    user = request.user

    if user.role == 'poster':
        from tasks.models import Task
        tasks = Task.objects.filter(poster=user)
        stats = {
            'tasks_posted': tasks.count(),
            'tasks_open': tasks.filter(status='open').count(),
            'tasks_in_progress': tasks.filter(status='assigned').count(),
            'tasks_completed': tasks.filter(status='completed').count(),
            'total_spent': float(
                tasks.filter(status='completed').aggregate(
                    total=Sum('budget')
                )['total'] or 0
            ),
        }
    else:
        from bids.models import Bid
        from tasks.models import Task
        bids = Bid.objects.filter(tasker=user)
        completed = Task.objects.filter(assigned_tasker=user, status='completed')
        stats = {
            'bids_placed': bids.count(),
            'bids_accepted': bids.filter(status='accepted').count(),
            'bids_pending': bids.filter(status='pending').count(),
            'tasks_completed': completed.count(),
            'total_earned': float(
                completed.aggregate(total=Sum('budget'))['total'] or 0
            ),
        }
    return Response(stats)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_student(request):
    user = request.user

    if user.role != 'tasker':
        return Response(
            {'error': 'Only taskers need verification'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if user.is_verified:
        return Response(
            {'error': 'Account is already verified'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if user.verification_status == User.VERIFICATION_PENDING:
        return Response(
            {'error': 'Verification is already pending review'},
            status=status.HTTP_400_BAD_REQUEST
        )

    edu_email = request.data.get('edu_email', '').strip().lower()

    if not edu_email:
        return Response(
            {'error': 'Please provide your university email address'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not any(edu_email.endswith(domain) for domain in ALLOWED_EDU_DOMAINS):
        return Response(
            {'error': 'Email must be a valid university address (e.g. .edu or .ac.ke)'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.verification_email = edu_email
    user.verification_status = User.VERIFICATION_PENDING
    user.save()

    return Response({
        'message': 'Verification request submitted. An admin will review your application.',
        'user': UserSerializer(user).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_poster(request):
    user = request.user

    if user.role != 'poster':
        return Response(
            {'error': 'This endpoint is for resident accounts only'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if user.is_verified:
        return Response(
            {'error': 'Account is already verified'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if user.verification_status == User.VERIFICATION_PENDING:
        return Response(
            {'error': 'Verification is already pending review'},
            status=status.HTTP_400_BAD_REQUEST
        )

    phone = request.data.get('phone', '').strip()
    id_number = request.data.get('id_number', '').strip()

    if not phone:
        return Response(
            {'error': 'Please provide your phone number'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not id_number:
        return Response(
            {'error': 'Please provide your national ID number'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.phone = phone
    user.id_number = id_number
    user.verification_status = User.VERIFICATION_PENDING
    user.save()

    return Response({
        'message': 'Identity verification submitted. An admin will review your application.',
        'user': UserSerializer(user).data
    })
