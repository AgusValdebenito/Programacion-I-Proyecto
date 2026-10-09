from rest_framework import serializers

from .models import Cart, CartItem, Order, OrderItem, Product, Store


class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = [
            "id",
            "owner",
            "name",
            "description",
            "image",
            "created_at",
        ]
        read_only_fields = ["owner", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "store",
            "name",
            "description",
            "price",
            "is_available",
            "stock",
            "image",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ["id", "user", "created_at"]
        read_only_fields = ["user", "created_at"]


class CartItemSerializer(serializers.ModelSerializer):
    """Serializador para items de carrito.

    Se remueven los validadores de unicidad generados automaticamente
    a nivel de serializador (unique_cart_product) para que la vista/servicio
    pueda gestionar el incremento acumulativo de cantidad cuando se vuelve a
    agregar el mismo producto al carrito.
    """

    class Meta:
        model = CartItem
        fields = ["id", "cart", "product", "quantity"]
        validators = []


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "store",
            "total",
            "status",
            "created_at",
        ]
        read_only_fields = ["user", "created_at"]


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "order", "product", "quantity", "unit_price"]
        read_only_fields = ["unit_price"]
