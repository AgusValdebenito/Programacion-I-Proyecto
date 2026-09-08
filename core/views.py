from django.db import models
from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from users.models import Usuario

from .models import Cart, CartItem, Order, OrderItem, Product, Store
from .permissions import (
    IsAdminOrVendedor,
    IsOrderParticipantOrAdmin,
    IsResourceOwnerOrReadOnly,
)
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    OrderItemSerializer,
    OrderSerializer,
    ProductSerializer,
    StoreSerializer,
)


class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all().order_by("id")
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsResourceOwnerOrReadOnly]

    def perform_create(self, serializer):
        if Store.objects.filter(owner=self.request.user).exists():
            raise ValidationError({"detail": "Este usuario ya tiene una tienda creada."})

        serializer.save(owner=self.request.user)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("id")
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsResourceOwnerOrReadOnly]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminOrVendedor(), IsResourceOwnerOrReadOnly()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def perform_create(self, serializer):
        store = serializer.validated_data["store"]
        if store.owner != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("Solo el propietario de la tienda puede publicar productos.")

        serializer.save()


class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all().order_by("id")
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated, IsResourceOwnerOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()

        return self.queryset.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data={})
        serializer.is_valid(raise_exception=True)
        cart, created = Cart.objects.get_or_create(user=request.user)

        response_serializer = self.get_serializer(cart)
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=response_status, headers=headers)


class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all().order_by("id")
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsResourceOwnerOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()

        return self.queryset.filter(cart__user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = serializer.validated_data["cart"]
        if cart.user != self.request.user:
            raise PermissionDenied("Solo podes agregar items a tu propio carrito.")

        product = serializer.validated_data["product"]

        # 1. Validar disponibilidad del producto
        if not product.is_available:
            raise ValidationError({"product": "Este producto no se encuentra disponible actualmente."})

        # 2. Validar regla de mono-tienda en el carrito
        existing_items = CartItem.objects.filter(cart=cart).select_related("product__store")
        if existing_items.exists():
            current_store = existing_items.first().product.store
            if product.store != current_store:
                raise ValidationError({
                    "detail": (
                        f"No podes agregar productos de '{product.store.name}' porque ya tenes items "
                        f"de '{current_store.name}' en tu carrito. Vacia el carrito para cambiar de tienda."
                    )
                })

        quantity = serializer.validated_data["quantity"]
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save(update_fields=["quantity"])

        response_serializer = self.get_serializer(cart_item)
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=response_status, headers=headers)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("id")
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipantOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, "role", None) == Usuario.RoleChoices.ADMIN:
            return super().get_queryset()

        # Si el usuario es dueño de una tienda, también puede ver los pedidos realizados a su tienda
        return self.queryset.filter(models.Q(user=user) | models.Q(store__owner=user)).distinct()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user
        new_status = serializer.validated_data.get("status", instance.status)

        # Si el estado no cambia, permitir la actualización ordinaria
        if new_status == instance.status:
            serializer.save()
            return

        is_admin = user.is_staff or getattr(user, "role", None) == Usuario.RoleChoices.ADMIN
        is_vendor = instance.store.owner == user
        is_client = instance.user == user

        if is_admin:
            serializer.save()
            return

        if is_client and not is_vendor:
            # El cliente solo puede cancelar un pedido si todavia esta pendiente
            if new_status == Order.StatusChoices.CANCELLED:
                if instance.status != Order.StatusChoices.PENDING:
                    raise ValidationError({"detail": "Solo podes cancelar pedidos en estado 'Pendiente'."})
                serializer.save()
                return
            else:
                raise PermissionDenied("Los clientes solo pueden consultar o cancelar sus pedidos pendientes.")

        if is_vendor:
            # Validar transiciones de tienda: preparing -> delivering -> delivered (o cancelled)
            allowed_transitions = {
                Order.StatusChoices.PENDING: [Order.StatusChoices.PREPARING, Order.StatusChoices.CANCELLED],
                Order.StatusChoices.PREPARING: [Order.StatusChoices.DELIVERING, Order.StatusChoices.CANCELLED],
                Order.StatusChoices.DELIVERING: [Order.StatusChoices.DELIVERED, Order.StatusChoices.CANCELLED],
                Order.StatusChoices.DELIVERED: [],
                Order.StatusChoices.CANCELLED: [],
            }
            if new_status not in allowed_transitions.get(instance.status, []):
                raise ValidationError({
                    "detail": f"Transicion de estado no valida de '{instance.status}' a '{new_status}'."
                })
            serializer.save()
            return

        raise PermissionDenied("No tenes permisos para modificar este pedido.")


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all().order_by("id")
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipantOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, "role", None) == Usuario.RoleChoices.ADMIN:
            return super().get_queryset()

        return self.queryset.filter(
            models.Q(order__user=user) | models.Q(order__store__owner=user)
        ).distinct()

    def perform_create(self, serializer):
        order = serializer.validated_data["order"]
        product = serializer.validated_data["product"]
        user = self.request.user

        if order.user != user and not (user.is_staff or getattr(user, "role", None) == Usuario.RoleChoices.ADMIN):
            raise PermissionDenied("Solo podes agregar items a tus propios pedidos.")

        # Validar disponibilidad del producto
        if not product.is_available:
            raise ValidationError({"product": "Este producto no se encuentra disponible."})

        # Validar mono-tienda (el producto debe pertenecer a la misma tienda del pedido)
        if product.store != order.store:
            raise ValidationError({
                "detail": f"El producto '{product.name}' pertenece a otra tienda y no puede agregarse a este pedido."
            })

        serializer.save()

