from django.contrib import admin

from .models import Cart, CartItem, FavoriteStore, Order, OrderItem, OrderRating, Product, Store


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "created_at")
    search_fields = ("name", "owner__username", "owner__email")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "store", "price", "created_at")
    list_filter = ("store",)
    search_fields = ("name", "store__name")


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at")
    search_fields = ("user__username", "user__email", "user__name")


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("cart", "product", "quantity")
    list_filter = ("product",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "total", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("user__username", "user__email", "user__name")


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "quantity", "unit_price")


@admin.register(FavoriteStore)
class FavoriteStoreAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "store", "created_at")
    search_fields = ("user__username", "user__email", "store__name")
    list_filter = ("created_at",)


@admin.register(OrderRating)
class OrderRatingAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "rating", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("order__id", "order__user__username", "order__user__email")
