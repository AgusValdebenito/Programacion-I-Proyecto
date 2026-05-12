from rest_framework import serializers

from .models import Cart, CartItem, Order, OrderItem, Product, Store


class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = "__all__"
        read_only_fields = ["owner", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ["created_at"]


class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = "__all__"
        read_only_fields = ["user", "created_at"]


class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ["user", "created_at"]


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = "__all__"
