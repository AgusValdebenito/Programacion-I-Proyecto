from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from django.test import TestCase

from .models import Cart, CartItem, Order, OrderItem, Product, Store

User = get_user_model()


class ModelRepresentationAndConstraintsTests(TestCase):
    """Pruebas unitarias para modelos y restricciones del dominio (TP2)."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="cliente-modelo",
            email="cliente@example.com",
            password="testpass123",
            role="cliente",
        )
        self.vendor = User.objects.create_user(
            username="vendedor-modelo",
            email="vendedor@example.com",
            password="testpass123",
            role="vendedor",
        )
        self.store = Store.objects.create(
            owner=self.vendor,
            name="Pizzeria Don Pepe",
            description="Las mejores pizzas",
        )
        self.product = Product.objects.create(
            store=self.store,
            name="Pizza Fugazzeta",
            price=Decimal("12.50"),
            stock=15,
        )

    def test_store_str_and_defaults(self):
        self.assertEqual(str(self.store), "Pizzeria Don Pepe")
        self.assertEqual(self.store.owner, self.vendor)

    def test_store_one_to_one_owner_constraint(self):
        with self.assertRaises(IntegrityError):
            Store.objects.create(owner=self.vendor, name="Segunda Tienda Duplicada")

    def test_product_str_and_defaults(self):
        self.assertEqual(str(self.product), "Pizza Fugazzeta")
        self.assertTrue(self.product.is_available)
        self.assertEqual(self.product.stock, 15)

    def test_cart_str_and_user_relationship(self):
        cart = Cart.objects.create(user=self.user)
        self.assertEqual(str(cart), f"Carrito de {self.user}")

    def test_cart_one_to_one_user_constraint(self):
        Cart.objects.create(user=self.user)
        with self.assertRaises(IntegrityError):
            Cart.objects.create(user=self.user)

    def test_cart_item_str_and_unique_constraint(self):
        cart = Cart.objects.create(user=self.user)
        item = CartItem.objects.create(cart=cart, product=self.product, quantity=3)
        self.assertEqual(str(item), f"3 x {self.product.name}")

        with self.assertRaises(IntegrityError):
            CartItem.objects.create(cart=cart, product=self.product, quantity=1)

    def test_order_str_and_default_status(self):
        order = Order.objects.create(
            user=self.user,
            store=self.store,
            total=Decimal("37.50"),
        )
        self.assertEqual(str(order), f"Pedido #{order.pk}")
        self.assertEqual(order.status, Order.StatusChoices.PENDING)

    def test_order_item_str_and_unit_price(self):
        order = Order.objects.create(
            user=self.user,
            store=self.store,
            total=Decimal("25.00"),
        )
        order_item = OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=2,
            unit_price=self.product.price,
        )
        self.assertEqual(str(order_item), f"2 x {self.product.name}")
        self.assertEqual(order_item.unit_price, Decimal("12.50"))
