from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/elevator/', consumers.ElevatorConsumer.as_asgi()),
]
