from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem, Product, Store


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
