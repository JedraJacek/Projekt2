from django.utils import timezone
from django.shortcuts import render

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import NoteSerializer, UserSerializer
from .models import Note, User
from .session import Session


class NoteView(APIView):
    def get(self, request):
        session = request.query_params.get('Session')

        data = Note.objects.all()

        serializer = NoteSerializer(data, context={'request': request}, many=True)
        return Response(serializer.data)


class UserView(APIView):
    def get(self, request):
        data = User.objects.all()
        serializer = UserSerializer(data, context={'request': request}, many=True)
        return Response(serializer.data)

class CreateNoteView(APIView):
    def post(self, request):
        note_text = request.data.get('note_text')
        owner_id = request.data.get('owner')  # Assuming owner is an ID
        print(note_text, owner_id)
        try:
            owner = User.objects.get(id=owner_id)
            Note.objects.create(
                note_text=note_text,
                pub_date=timezone.now(),
                owner=owner
            )
            return Response({'message': 'Note created successfully'}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'})

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CheckUser(generics.CreateAPIView):
    def post(self, request):
        try:
            User.objects.get(username=request.data.get('login'), password=request.data.get('password'))
            Session.add_user(Session, request.data.get('login'))
            return Response({'Session': request.data.get('login')}, status=status.HTTP_200_OK)
        except:
            return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
        
