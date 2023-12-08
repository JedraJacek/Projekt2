from django.urls import path
from .views import NoteView, UserView, CreateUserView, CreateNoteView, LogInView

urlpatterns = [
    path("notes", NoteView.as_view()),
    path("users", UserView.as_view()),
    path("create-note", CreateNoteView.as_view()),
    path("create-user", CreateUserView.as_view()),
    path("login-user", LogInView.as_view())
]
