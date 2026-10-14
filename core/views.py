from django.db import models
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from users.models import Usuario

from .models import Cart, CartItem, Order, OrderItem, Product, Store
from .permissions import (
    IsAdminOrVendedor,
    IsClienteOrAdmin,
    IsOrderParticipantOrAdmin,
    IsResourceOwnerOrReadOnly,
    is_admin_user,
)
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    OrderItemSerializer,
    OrderSerializer,
    ProductSerializer,
    StoreSerializer,
)
from .services import CartService, OrderService


class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all().order_by("id")
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsResourceOwnerOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        owner_id = self.request.query_params.get("owner")
        if owner_id:
            if owner_id == "me" and self.request.user.is_authenticated:
                queryset = queryset.filter(owner=self.request.user)
            else:
                queryset = queryset.filter(owner_id=owner_id)
        return queryset

    @action(detail=False, methods=["get"], url_path="my-store", permission_classes=[permissions.IsAuthenticated])
    def my_store(self, request):
        store = Store.objects.filter(owner=request.user).first()
        if not store:
            return Response({"detail": "No tenés ninguna tienda asociada."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(store)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        if Store.objects.filter(owner=self.request.user).exists():
            raise ValidationError({"detail": "Este usuario ya tiene una tienda creada."})

        serializer.save(owner=self.request.user)

        user = self.request.user
        if user.role != Usuario.RoleChoices.VENDEDOR:
            user.role = Usuario.RoleChoices.VENDEDOR
            user.save(update_fields=["role"])


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("id")
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsResourceOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "description"]

    def get_queryset(self):
        queryset = super().get_queryset()
        store_id = self.request.query_params.get("store")
        if store_id:
            queryset = queryset.filter(store_id=store_id)

        is_available = self.request.query_params.get("is_available")
        if is_available is not None:
            if is_available.lower() in ("true", "1"):
                queryset = queryset.filter(is_available=True)
            elif is_available.lower() in ("false", "0"):
                queryset = queryset.filter(is_available=False)

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
        new_store = serializer.validated_data.get("store", instance.store)
        if new_store != instance.store and not is_admin_user(self.request.user):
            raise ValidationError({"store": "No podés reasignar un producto a otra tienda."})
        serializer.save()


class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all().order_by("id")
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated, IsResourceOwnerOrReadOnly]

    def get_queryset(self):
        if is_admin_user(self.request.user):
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

    @action(detail=False, methods=["get"], url_path="active", url_name="active")
    def active_cart(self, request):
        """Retorna el carrito activo del usuario con sus items y detalles de producto."""
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["delete"], url_path="clear", url_name="clear")
    def clear_cart(self, request):
        """Vacia todos los items del carrito activo del usuario."""
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({"detail": "Carrito vaciado exitosamente."}, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        url_path="checkout",
        url_name="checkout",
        permission_classes=[permissions.IsAuthenticated, IsClienteOrAdmin],
    )
    def checkout(self, request):
        """Convierte atómicamente el carrito activo en un nuevo pedido."""
        delivery_address = request.data.get("address") or request.data.get("delivery_address")
        delivery_phone = request.data.get("phone") or request.data.get("delivery_phone")
        delivery_notes = request.data.get("notes") or request.data.get("delivery_notes")
        payment_method = request.data.get("payment_method") or request.data.get("paymentMethod")

        order = OrderService.checkout_cart(
            user=request.user,
            delivery_address=delivery_address,
            delivery_phone=delivery_phone,
            delivery_notes=delivery_notes,
            payment_method=payment_method,
        )
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all().order_by("id")
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsResourceOwnerOrReadOnly]

    def get_queryset(self):
        if is_admin_user(self.request.user):
            return super().get_queryset()

        return self.queryset.filter(cart__user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = serializer.validated_data["cart"]
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        cart_item, created = CartService.add_item_to_cart(
            cart=cart,
            product=product,
            quantity=quantity,
            user=request.user,
        )

        response_serializer = self.get_serializer(cart_item)
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=response_status, headers=headers)

    def perform_update(self, serializer):
        instance = self.get_object()
        if "cart" in serializer.validated_data and serializer.validated_data["cart"] != instance.cart:
            raise ValidationError({"cart": "No podés transferir un ítem a otro carrito."})
        if "product" in serializer.validated_data and serializer.validated_data["product"] != instance.product:
            raise ValidationError({"product": "No podés cambiar el producto de un ítem existente."})

        new_quantity = serializer.validated_data.get("quantity", instance.quantity)
        if new_quantity < 1:
            raise ValidationError({"quantity": "La cantidad debe ser mayor o igual a 1."})
        if new_quantity > CartService.MAX_QUANTITY_PER_ITEM:
            raise ValidationError({
                "quantity": f"El límite máximo por producto es de {CartService.MAX_QUANTITY_PER_ITEM} unidades."
            })
        if instance.product.track_stock and instance.product.stock < new_quantity:
            raise ValidationError({
                "quantity": f"Stock insuficiente para '{instance.product.name}'. Stock disponible: {instance.product.stock}."
            })
        serializer.save()


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("id")
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipantOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if is_admin_user(user):
            queryset = super().get_queryset()
        else:
            queryset = self.queryset.filter(models.Q(user=user) | models.Q(store__owner=user)).distinct()

        store_id = self.request.query_params.get("store")
        if store_id:
            queryset = queryset.filter(store_id=store_id)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if not (is_admin_user(user) or getattr(user, "role", None) == Usuario.RoleChoices.CLIENTE):
            raise PermissionDenied(
                "Los vendedores no pueden realizar pedidos. Esta acción está reservada para clientes y administradores."
            )
        raise ValidationError(
            {"detail": "La creación directa de pedidos no está permitida. Use el checkout del carrito (/api/carts/checkout/)."}
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        if "total" in self.request.data:
            raise ValidationError({"total": "No está permitido modificar el total de un pedido existente."})
        if "store" in self.request.data:
            raise ValidationError({"store": "No está permitido modificar la tienda de un pedido existente."})

        new_status = self.request.data.get("status", instance.status)

        if new_status == instance.status:
            return

        cancellation_reason = self.request.data.get("cancellation_reason")
        cancelled_product = self.request.data.get("cancelled_product") or self.request.data.get("out_of_stock_product")

        order = OrderService.transition_status(
            order=instance,
            new_status=new_status,
            user=self.request.user,
            cancellation_reason=cancellation_reason,
            cancelled_product=cancelled_product,
        )
        serializer.instance = order

    def destroy(self, request, *args, **kwargs):
        raise ValidationError({"detail": "Los pedidos no pueden ser eliminados. Use la cancelación de pedidos."})


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all().order_by("id")
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipantOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if is_admin_user(user):
            return super().get_queryset()

        return self.queryset.filter(
            models.Q(order__user=user) | models.Q(order__store__owner=user)
        ).distinct()

    def perform_create(self, serializer):
        from django.db import transaction

        user = self.request.user
        if not (is_admin_user(user) or getattr(user, "role", None) == Usuario.RoleChoices.CLIENTE):
            raise PermissionDenied(
                "Los vendedores no pueden realizar pedidos. Esta acción está reservada para clientes y administradores."
            )

        order = serializer.validated_data["order"]
        if order.status != Order.StatusChoices.PENDING:
            raise ValidationError({"detail": "Solo se pueden agregar ítems a pedidos en estado 'Pendiente'."})

        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        with transaction.atomic():
            unit_price = OrderService.validate_and_prepare_item(
                order=order,
                product=product,
                quantity=quantity,
                user=self.request.user,
            )

            serializer.save(unit_price=unit_price)

            # Recalcular el total del pedido
            order.total += unit_price * quantity
            order.save(update_fields=["total"])

    def destroy(self, request, *args, **kwargs):
        raise ValidationError({"detail": "Los ítems de pedido no pueden ser eliminados individualmente."})
