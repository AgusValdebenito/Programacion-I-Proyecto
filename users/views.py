from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

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
        serializer.save()

    def perform_update(self, serializer):
        user = self.get_object()
        old_is_active = user.is_active
        updated_user = serializer.save()
        new_is_active = updated_user.is_active

        if old_is_active and not new_is_active:
            from core.models import Store
            from core.services import NotificationService, OrderService

            store = Store.objects.filter(owner=updated_user).first()
            if store and store.is_active:
                store.is_active = False
                store.save(update_fields=["is_active"])
                OrderService.cancel_pending_orders_for_store(store)
                NotificationService.notify_store_moderation(store, action="suspended")

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
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "El campo 'refresh' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Sesion cerrada correctamente."}, status=status.HTTP_200_OK)
        except TokenError as err:
            return Response({"detail": str(err)}, status=status.HTTP_400_BAD_REQUEST)
