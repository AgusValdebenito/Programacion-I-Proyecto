from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from .models import Cart, CartItem, Order, OrderItem, Product, Store
from .permissions import IsAdminOrVendedor, IsResourceOwnerOrReadOnly
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
        if store.owner != self.request.user:
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

        quantity = serializer.validated_data["quantity"]
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=serializer.validated_data["product"],
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
    permission_classes = [permissions.IsAuthenticated, IsResourceOwnerOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()

        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all().order_by("id")
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsResourceOwnerOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()

        return self.queryset.filter(order__user=self.request.user)

    def perform_create(self, serializer):
        order = serializer.validated_data["order"]
        if order.user != self.request.user:
            raise PermissionDenied("Solo podes agregar items a tus propios pedidos.")

        serializer.save()
