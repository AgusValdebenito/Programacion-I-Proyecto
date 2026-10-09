from django.db import models
from rest_framework import filters, permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from users.models import Usuario

from .models import Cart, CartItem, Order, OrderItem, Product, Store
from .permissions import (
    IsAdminOrVendedor,
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

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminOrVendedor(), IsResourceOwnerOrReadOnly()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def perform_create(self, serializer):
        store = serializer.validated_data["store"]
        if store.owner != self.request.user and not is_admin_user(self.request.user):
            raise PermissionDenied("Solo el propietario de la tienda puede publicar productos.")

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


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("id")
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipantOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if is_admin_user(user):
            return super().get_queryset()

        return self.queryset.filter(models.Q(user=user) | models.Q(store__owner=user)).distinct()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        new_status = serializer.validated_data.get("status", instance.status)

        if new_status == instance.status:
            serializer.save()
            return

        order = OrderService.transition_status(
            order=instance,
            new_status=new_status,
            user=self.request.user,
        )
        serializer.instance = order


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
        order = serializer.validated_data["order"]
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        unit_price = OrderService.validate_and_prepare_item(
            order=order,
            product=product,
            quantity=quantity,
            user=self.request.user,
        )

        serializer.save(unit_price=unit_price)
