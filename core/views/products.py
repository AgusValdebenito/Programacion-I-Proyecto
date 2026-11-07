from decimal import Decimal

from rest_framework import filters, permissions, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError

from ..models import CartItem, Product
from ..permissions import IsAdminOrVendedor, IsResourceOwnerOrReadOnly, is_admin_user
from ..serializers import ProductSerializer
from ..services import NotificationService, OrderService


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("id")
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsResourceOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "price", "stock", "id", "created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Excluir productos eliminados lógicamente (soft-deleted)
        queryset = queryset.filter(is_deleted=False)

        store_id = self.request.query_params.get("store")
        if store_id:
            queryset = queryset.filter(store_id=store_id)

        is_available = self.request.query_params.get("is_available")
        if is_available is not None:
            if is_available.lower() in ("true", "1"):
                queryset = queryset.filter(is_available=True)
            elif is_available.lower() in ("false", "0"):
                queryset = queryset.filter(is_available=False)

        min_price = self.request.query_params.get("min_price")
        if min_price is not None:
            try:
                queryset = queryset.filter(price__gte=Decimal(min_price))
            except Exception:
                pass

        max_price = self.request.query_params.get("max_price")
        if max_price is not None:
            try:
                queryset = queryset.filter(price__lte=Decimal(max_price))
            except Exception:
                pass

        # No mostrar productos de tiendas suspendidas a usuarios regulares
        if not is_admin_user(self.request.user):
            queryset = queryset.filter(store__is_active=True)

        return queryset

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminOrVendedor(), IsResourceOwnerOrReadOnly()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def perform_create(self, serializer):
        store = serializer.validated_data["store"]
        if store.owner != self.request.user and not is_admin_user(self.request.user):
            raise PermissionDenied("Solo el propietario de la tienda puede publicar productos.")

        serializer.save()

    def perform_update(self, serializer):
        instance = self.get_object()
        old_available = instance.is_available
        new_store = serializer.validated_data.get("store", instance.store)
        if new_store != instance.store and not is_admin_user(self.request.user):
            raise ValidationError({"store": "No podés reasignar un producto a otra tienda."})

        product = serializer.save()
        new_available = product.is_available

        # Si se desactivó la disponibilidad
        if old_available and not new_available:
            # 1. Cancelar pedidos pendientes con este producto y reintegrar stock del resto
            OrderService.cancel_pending_orders_for_product(
                product,
                reason=f"Cancelado automáticamente: el producto '{product.name}' ya no se encuentra disponible."
            )
            # 2. Notificar y remover de carritos activos de clientes
            cart_items = CartItem.objects.filter(product=product).select_related("cart__user")
            for c_item in cart_items:
                NotificationService.notify_cart_item_removed(
                    user=c_item.cart.user,
                    product=product,
                    reason=f"El producto '{product.name}' ya no se encuentra disponible."
                )
                c_item.delete()
            # 3. Si fue moderado por un admin que no es el dueño, avisar a la tienda
            if is_admin_user(self.request.user) and product.store.owner != self.request.user:
                NotificationService.notify_product_moderation(product, action="suspended")

    def perform_destroy(self, instance):
        # 1. Cancelar pedidos pendientes con este producto
        OrderService.cancel_pending_orders_for_product(
            instance,
            reason=f"Cancelado automáticamente: el producto '{instance.name}' fue eliminado."
        )
        # 2. Notificar y remover de carritos activos
        cart_items = CartItem.objects.filter(product=instance).select_related("cart__user")
        for c_item in cart_items:
            NotificationService.notify_cart_item_removed(
                user=c_item.cart.user,
                product=instance,
                reason=f"El producto '{instance.name}' fue retirado del menú."
            )
            c_item.delete()

        # 3. Si fue un admin distinto del dueño, notificar a la tienda
        if is_admin_user(self.request.user) and instance.store.owner != self.request.user:
            NotificationService.notify_product_moderation(instance, action="deleted")

        # 4. Soft-delete si el producto fue comprado en pedidos históricos (evita ProtectedError 500)
        if instance.order_items.exists():
            instance.is_deleted = True
            instance.is_available = False
            instance.save(update_fields=["is_deleted", "is_available"])
        else:
            instance.delete()
