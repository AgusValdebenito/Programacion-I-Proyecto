from rest_framework import serializers

from .models import Cart, CartItem, FavoriteStore, Notification, Order, OrderItem, OrderRating, Product, Store


class StoreSerializer(serializers.ModelSerializer):
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Store
        fields = [
            "id",
            "owner",
            "name",
            "description",
            "image",
            "is_active",
            "is_favorite",
            "created_at",
        ]
        read_only_fields = ["owner", "is_favorite", "created_at"]

    def get_is_favorite(self, obj) -> bool:
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            if hasattr(obj, "_prefetched_objects_cache") and "favorites" in obj._prefetched_objects_cache:
                return any(fav.user_id == request.user.id for fav in obj.favorites.all())
            return obj.favorites.filter(user=request.user).exists()
        return False

    def to_internal_value(self, data):
        if isinstance(data, dict) and "image" in data:
            image_val = data.get("image")
            if isinstance(image_val, str):
                mutable_data = data.copy()
                if self.instance and (not image_val or image_val.startswith("http") or image_val.startswith("/")):
                    mutable_data.pop("image")
                elif not image_val:
                    mutable_data["image"] = None
                data = mutable_data
        return super().to_internal_value(data)


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
            "track_stock",
            "image",
            "is_deleted",
            "created_at",
        ]
        read_only_fields = ["created_at", "is_deleted"]

    def to_internal_value(self, data):
        if isinstance(data, dict) and "image" in data:
            image_val = data.get("image")
            if isinstance(image_val, str):
                mutable_data = data.copy()
                if self.instance and (not image_val or image_val.startswith("http") or image_val.startswith("/")):
                    mutable_data.pop("image")
                elif not image_val:
                    mutable_data["image"] = None
                data = mutable_data
        return super().to_internal_value(data)


class CartItemSerializer(serializers.ModelSerializer):
    """Serializador para items de carrito.

    Se remueven los validadores de unicidad generados automaticamente
    a nivel de serializador (unique_cart_product) para que la vista/servicio
    pueda gestionar el incremento acumulativo de cantidad cuando se vuelve a
    agregar el mismo producto al carrito.
    """

    product_details = ProductSerializer(source="product", read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "cart", "product", "quantity", "product_details"]
        validators = []


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "user", "items", "created_at"]
        read_only_fields = ["user", "created_at"]


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["id", "order", "product", "product_name", "quantity", "unit_price"]
        read_only_fields = ["unit_price"]

    def get_product_name(self, obj) -> str:
        if obj.product_name:
            return obj.product_name
        if obj.product:
            return obj.product.name
        return "Producto no disponible" 



class OrderRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderRating
        fields = ["id", "rating", "tags", "comment", "created_at"]
        read_only_fields = ["id", "created_at"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    rating = OrderRatingSerializer(read_only=True)
    store_name = serializers.CharField(source="store.name", read_only=True)
    cancelled_product_name = serializers.CharField(source="cancelled_product.name", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "store",
            "store_name",
            "items",
            "total",
            "status",
            "delivery_address",
            "delivery_phone",
            "delivery_notes",
            "payment_method",
            "cancellation_reason",
            "cancelled_product",
            "cancelled_product_name",
            "rating",
            "created_at",
        ]
        read_only_fields = [
            "user",
            "created_at",
            "store",
            "total",
            "status",
            "cancelled_product_name",
        ]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "title",
            "message",
            "notification_type",
            "is_read",
            "link",
            "created_at",
        ]
        read_only_fields = ["id", "user", "created_at"]
