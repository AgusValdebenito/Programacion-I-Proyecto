from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import UsuarioViewSet

router = DefaultRouter()
router.register(r"users", UsuarioViewSet, basename="users")

urlpatterns = [
    path("", include(router.urls)),
    path("register/", UsuarioViewSet.as_view({"post": "create"}), name="register"),
    path("profile/", UsuarioViewSet.as_view({"get": "profile", "patch": "profile"}), name="profile"),
    path("logout/", UsuarioViewSet.as_view({"post": "logout"}), name="logout"),
]
