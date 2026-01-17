from django.urls import path
from . import views

urlpatterns = [
    path('challenges/', views.get_challenges, name='get_challenges'),
    path('challenges/verify/', views.verify_challenge, name='verify_challenge'),
    path('session/start/', views.start_session, name='start_session'),
    path('session/<str:session_id>/complete/', views.complete_session, name='complete_session'),
]
