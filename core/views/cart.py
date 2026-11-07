from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from ..models import Cart, CartItem
from ..permissions import IsClienteOrAdmin, IsResourceOwnerOrReadOnly, is_admin_user
from ..serializers import CartItemSerializer, CartSerializer, OrderSerializer
from ..services import CartService, OrderService


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
