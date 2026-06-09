from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Usuario
from .serializers import UsuarioSerializer


class RegistroUsuarioPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == "create":
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj == request.user


class UsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = UsuarioSerializer
    permission_classes = [RegistroUsuarioPermission]

    def get_queryset(self):
        queryset = Usuario.objects.all().order_by("id")

        if self.request.user.is_staff:
            return queryset

        if self.request.user.is_authenticated:
            return queryset.filter(pk=self.request.user.pk)

        return queryset.none()

    def perform_create(self, serializer):
        serializer.save(role=Usuario.RoleChoices.CLIENTE)

    @action(detail=False, methods=["get", "patch"], permission_classes=[permissions.IsAuthenticated])
    def profile(self, request):
        if request.method == "GET":
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        try:
            refresh_token = request.data["refresh"]
            from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

            token = OutstandingToken.objects.get(token=refresh_token)
            BlacklistedToken.objects.get_or_create(token=token)
        except (KeyError, OutstandingToken.DoesNotExist):
            pass

        return Response({"detail": "Sesion cerrada correctamente."}, status=status.HTTP_200_OK)
