from rest_framework import viewsets
from rest_framework import status
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


class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all().order_by("id")
    serializer_class = StoreSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("id")
    serializer_class = ProductSerializer


class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all().order_by("id")
    serializer_class = CartSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        cart, created = Cart.objects.get_or_create(user=user)

        response_serializer = self.get_serializer(cart)
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=response_status, headers=headers)


class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all().order_by("id")
    serializer_class = CartItemSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("id")
    serializer_class = OrderSerializer


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all().order_by("id")
    serializer_class = OrderItemSerializer
