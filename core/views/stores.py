from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from users.models import Usuario

from ..models import CartItem, FavoriteStore, Store
from ..permissions import IsResourceOwnerOrReadOnly, is_admin_user
from ..serializers import StoreSerializer
from ..services import NotificationService, OrderService


class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all().order_by("id")
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsResourceOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "id", "created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        owner_id = self.request.query_params.get("owner")
        if owner_id:
            if owner_id == "me" and self.request.user.is_authenticated:
                queryset = queryset.filter(owner=self.request.user)
            else:
                queryset = queryset.filter(owner_id=owner_id)

        # Usuarios regulares no ven tiendas suspendidas, salvo que el dueño consulte su propia tienda
        if not is_admin_user(self.request.user):
            if owner_id != "me":
                queryset = queryset.filter(is_active=True)
        else:
            is_active = self.request.query_params.get("is_active")
            if is_active is not None:
                if is_active.lower() in ("true", "1"):
                    queryset = queryset.filter(is_active=True)
                elif is_active.lower() in ("false", "0"):
                    queryset = queryset.filter(is_active=False)

        if self.request.user and self.request.user.is_authenticated:
            queryset = queryset.prefetch_related("favorites")

        return queryset

    @action(detail=False, methods=["get"], url_path="my-store", permission_classes=[permissions.IsAuthenticated])
    def my_store(self, request):
        store = Store.objects.filter(owner=request.user).first()
        if not store:
            return Response({"detail": "No tenés ninguna tienda asociada."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(store)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="toggle-active", permission_classes=[permissions.IsAuthenticated])
    def toggle_active(self, request, pk=None):
        if not is_admin_user(request.user):
            raise PermissionDenied("Solo los administradores pueden suspender o reactivar tiendas.")
        store = self.get_object()
        store.is_active = not store.is_active
        store.save(update_fields=["is_active"])
        return Response(self.get_serializer(store).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="toggle-favorite", permission_classes=[permissions.IsAuthenticated])
    def toggle_favorite(self, request, pk=None):
        store = self.get_object()
        favorite = FavoriteStore.objects.filter(user=request.user, store=store).first()
        if favorite:
            favorite.delete()
            return Response(
                {"detail": "Comercio quitado de favoritos.", "favorited": False, "store_id": store.id},
                status=status.HTTP_200_OK,
            )
        FavoriteStore.objects.create(user=request.user, store=store)
        return Response(
            {"detail": "Comercio agregado a favoritos.", "favorited": True, "store_id": store.id},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="favorites", permission_classes=[permissions.IsAuthenticated])
    def favorites(self, request):
        fav_stores = Store.objects.filter(favorites__user=request.user, is_active=True).order_by("-favorites__created_at")
        serializer = self.get_serializer(fav_stores, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        if Store.objects.filter(owner=self.request.user).exists():
            raise ValidationError({"detail": "Este usuario ya tiene una tienda creada."})

        serializer.save(owner=self.request.user)

        user = self.request.user
        if user.role != Usuario.RoleChoices.VENDEDOR:
            user.role = Usuario.RoleChoices.VENDEDOR
            user.save(update_fields=["role"])

    def perform_update(self, serializer):
        instance = self.get_object()
        old_is_active = instance.is_active

        if "is_active" in serializer.validated_data and not is_admin_user(self.request.user):
            raise PermissionDenied("Solo los administradores pueden suspender o reactivar tiendas.")

        store = serializer.save()
        new_is_active = store.is_active

        if old_is_active and not new_is_active:
            # 1. Cancelar pedidos pendientes de la tienda y reintegrar stock
            OrderService.cancel_pending_orders_for_store(store)
            # 2. Notificar y vaciar carritos que contengan productos de esta tienda
            cart_items = CartItem.objects.filter(product__store=store).select_related("cart__user", "product")
            for c_item in cart_items:
                NotificationService.notify_cart_item_removed(
                    user=c_item.cart.user,
                    product=c_item.product,
                    reason=f"La tienda '{store.name}' fue suspendida preventivamente por administración."
                )
                c_item.delete()
            # 3. Notificar al dueño del comercio
            NotificationService.notify_store_moderation(store, action="suspended")
        elif not old_is_active and new_is_active:
            NotificationService.notify_store_moderation(store, action="reactivated")

    def perform_destroy(self, instance):
        if instance.orders.exists():
            raise ValidationError({
                "detail": "No podés eliminar una tienda que posee un historial de pedidos. Podés suspenderla para archivarla."
            })
        NotificationService.notify_store_moderation(instance, action="deleted")
        instance.delete()
