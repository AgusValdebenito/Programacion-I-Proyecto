from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Cart, CartItem, Order, OrderItem, Product, Store
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    OrderItemSerializer,
    OrderSerializer,
    ProductSerializer,
    StoreSerializer,
)


class IsResourceOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.user.is_staff:
            return True

        owner = None
        if isinstance(obj, Store):
            owner = obj.owner
        elif isinstance(obj, Product):
            owner = obj.store.owner
        elif isinstance(obj, Cart):
            owner = obj.user
        elif isinstance(obj, CartItem):
            owner = obj.cart.user
        elif isinstance(obj, Order):
            owner = obj.user
        elif isinstance(obj, OrderItem):
            owner = obj.order.user

        return owner == request.user


class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all().order_by("id")
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsResourceOwnerOrReadOnly]

    def perform_create(self, serializer):
        if self.request.user.role != "store":
            raise PermissionDenied("Solo los usuarios con rol store pueden crear una tienda.")

        serializer.save(owner=self.request.user)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("id")
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsResourceOwnerOrReadOnly]

    def perform_create(self, serializer):
        store = serializer.validated_data["store"]
        if self.request.user.role != "store" or store.owner != self.request.user:
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

    def perform_create(self, serializer):
        cart = serializer.validated_data["cart"]
        if cart.user != self.request.user:
            raise PermissionDenied("Solo podes agregar items a tu propio carrito.")

        serializer.save()


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
