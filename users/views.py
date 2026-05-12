from rest_framework import permissions, viewsets

from .models import Usuario
from .serializers import UsuarioSerializer


class UsuarioPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == "create":
            return True

        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj == request.user


class UsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = UsuarioSerializer
    permission_classes = [UsuarioPermission]

    def get_queryset(self):
        queryset = Usuario.objects.all().order_by("id")

        if self.request.user.is_staff:
            return queryset

        if self.request.user.is_authenticated:
            return queryset.filter(pk=self.request.user.pk)

        return queryset.none()
