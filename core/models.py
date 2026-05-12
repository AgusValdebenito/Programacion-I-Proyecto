from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Store(models.Model):
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="store",
        verbose_name="propietario",
    )
    name = models.CharField(max_length=100, verbose_name="nombre")
    description = models.TextField(blank=True, null=True, verbose_name="descripcion")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="fecha de creacion")

    class Meta:
        verbose_name = "tienda"
        verbose_name_plural = "tiendas"

    def __str__(self):
        return self.name


class Product(models.Model):
    store = models.ForeignKey(
        Store,
        on_delete=models.CASCADE,
        related_name="products",
        verbose_name="tienda",
    )
    name = models.CharField(max_length=100, verbose_name="nombre")
    description = models.TextField(blank=True, null=True, verbose_name="descripcion")
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        verbose_name="precio",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="fecha de creacion")

    class Meta:
        verbose_name = "producto"
        verbose_name_plural = "productos"

    def __str__(self):
        return self.name


class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
        verbose_name="usuario",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="fecha de creacion")

    class Meta:
        verbose_name = "carrito"
        verbose_name_plural = "carritos"

    def __str__(self):
        return f"Carrito de {self.user}"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="carrito",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="cart_items",
        verbose_name="producto",
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name="cantidad")

    class Meta:
        verbose_name = "item de carrito"
        verbose_name_plural = "items de carrito"
        constraints = [
            models.UniqueConstraint(fields=["cart", "product"], name="unique_cart_product")
        ]

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class Order(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = "pending", "Pendiente"
        PREPARING = "preparing", "En preparacion"
        DELIVERING = "delivering", "En reparto"
        DELIVERED = "delivered", "Entregado"
        CANCELLED = "cancelled", "Cancelado"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
        verbose_name="usuario",
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        verbose_name="total",
    )
    status = models.CharField(
        max_length=15,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
        verbose_name="estado",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="fecha de creacion")

    class Meta:
        verbose_name = "pedido"
        verbose_name_plural = "pedidos"

    def __str__(self):
        return f"Pedido #{self.pk}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="pedido",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="order_items",
        verbose_name="producto",
    )
    quantity = models.PositiveIntegerField(verbose_name="cantidad")
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        verbose_name="precio unitario",
    )

    class Meta:
        verbose_name = "item de pedido"
        verbose_name_plural = "items de pedido"

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
