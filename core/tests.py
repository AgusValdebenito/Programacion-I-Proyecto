from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Cart, CartItem, Order, OrderItem, Product, Store


class ProductViewSetTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username="store-owner",
            password="testpass123",
            email="store-owner@example.com",
            role="vendedor",
        )
        self.store = Store.objects.create(owner=self.owner, name="Mi tienda")
        self.product = Product.objects.create(
            store=self.store,
            name="Hamburguesa",
            description="Clasica",
            price=Decimal("10.50"),
        )

    def test_list_products_is_public(self):
        response = self.client.get(reverse("products-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.product.id)
        self.assertEqual(response.data[0]["name"], self.product.name)

    def test_retrieve_product_is_public(self):
        response = self.client.get(reverse("products-detail", args=[self.product.id]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.product.id)
        self.assertEqual(response.data["name"], self.product.name)
        self.assertEqual(response.data["store"], self.store.id)


class StoreViewSetTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username="existing-store-owner",
            password="testpass123",
            email="existing-store-owner@example.com",
            role="vendedor",
        )
        self.store = Store.objects.create(owner=self.owner, name="Tienda existente")

    def test_create_store_returns_400_when_user_already_has_store(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.post(
            reverse("stores-list"),
            {"name": "Otra tienda", "description": "No deberia crearse"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["detail"], "Este usuario ya tiene una tienda creada.")

    def test_create_store_promotes_user_role_to_vendedor(self):
        user_model = get_user_model()
        client_user = user_model.objects.create_user(
            username="client-user",
            password="testpass123",
            email="client-user@example.com",
            role="cliente",
        )
        self.client.force_authenticate(user=client_user)

        response = self.client.post(
            reverse("stores-list"),
            {"name": "Nueva tienda", "description": "Primera tienda"},
            format="json",
        )

        client_user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(client_user.role, "vendedor")

    def test_delete_store_demotes_user_role_to_cliente(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.delete(reverse("stores-detail", args=[self.store.id]))

        self.owner.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.owner.role, "cliente")


class CartItemViewSetTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username="cart-user",
            password="testpass123",
            email="cart-user@example.com",
            role="cliente",
        )
        self.store_owner = user_model.objects.create_user(
            username="cart-store-owner",
            password="testpass123",
            email="cart-store-owner@example.com",
            role="vendedor",
        )
        self.store = Store.objects.create(owner=self.store_owner, name="Tienda carrito")
        self.product = Product.objects.create(
            store=self.store,
            name="Pizza",
            description="Muzza",
            price=Decimal("15.00"),
            stock=10,
            is_available=True,
        )
        self.cart = Cart.objects.create(user=self.user)

    def test_create_cart_item_increments_quantity_for_existing_product(self):
        existing_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            reverse("cart-items-list"),
            {"cart": self.cart.id, "product": self.product.id, "quantity": 3},
            format="json",
        )

        existing_item.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(existing_item.quantity, 5)
        self.assertEqual(CartItem.objects.filter(cart=self.cart, product=self.product).count(), 1)

    def test_create_cart_item_creates_new_row_when_product_is_not_present(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            reverse("cart-items-list"),
            {"cart": self.cart.id, "product": self.product.id, "quantity": 2},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CartItem.objects.get(cart=self.cart, product=self.product).quantity, 2)

    def test_create_cart_item_fails_if_product_is_not_available(self):
        unavailable_product = Product.objects.create(
            store=self.store,
            name="Empanada",
            price=Decimal("5.00"),
            stock=10,
            is_available=False,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            reverse("cart-items-list"),
            {"cart": self.cart.id, "product": unavailable_product.id, "quantity": 1},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("product", response.data)

    def test_create_cart_item_fails_when_mixing_different_stores(self):
        user_model = get_user_model()
        other_owner = user_model.objects.create_user(
            username="other-vendor",
            password="testpass123",
            email="other-vendor@example.com",
            role="vendedor",
        )
        other_store = Store.objects.create(owner=other_owner, name="Segunda tienda")
        product_other_store = Product.objects.create(
            store=other_store,
            name="Sushi",
            price=Decimal("20.00"),
            stock=10,
            is_available=True,
        )

        # Agregamos primero un producto de la tienda 1
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=1)
        self.client.force_authenticate(user=self.user)

        # Intentamos agregar un producto de la tienda 2
        response = self.client.post(
            reverse("cart-items-list"),
            {"cart": self.cart.id, "product": product_other_store.id, "quantity": 1},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)


class OrderViewSetTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.client_user = user_model.objects.create_user(
            username="client-order-user",
            password="testpass123",
            email="client-order@example.com",
            role="cliente",
        )
        self.vendor_user = user_model.objects.create_user(
            username="vendor-order-user",
            password="testpass123",
            email="vendor-order@example.com",
            role="vendedor",
        )
        self.other_vendor = user_model.objects.create_user(
            username="other-vendor-order-user",
            password="testpass123",
            email="other-vendor-order@example.com",
            role="vendedor",
        )
        self.store = Store.objects.create(owner=self.vendor_user, name="Tienda de Pedidos")
        self.other_store = Store.objects.create(owner=self.other_vendor, name="Tienda Ajena")
        self.order = Order.objects.create(
            user=self.client_user,
            store=self.store,
            total=Decimal("100.00"),
            status=Order.StatusChoices.PENDING,
        )

    def test_vendor_can_transition_order_status_sequence(self):
        self.client.force_authenticate(user=self.vendor_user)

        # Pending -> Preparing
        response = self.client.patch(
            reverse("orders-detail", args=[self.order.id]),
            {"status": Order.StatusChoices.PREPARING},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.StatusChoices.PREPARING)

        # Preparing -> Delivering
        response = self.client.patch(
            reverse("orders-detail", args=[self.order.id]),
            {"status": Order.StatusChoices.DELIVERING},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.StatusChoices.DELIVERING)

        # Delivering -> Delivered
        response = self.client.patch(
            reverse("orders-detail", args=[self.order.id]),
            {"status": Order.StatusChoices.DELIVERED},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.StatusChoices.DELIVERED)

    def test_client_cannot_mark_order_as_delivered(self):
        self.client.force_authenticate(user=self.client_user)

        response = self.client.patch(
            reverse("orders-detail", args=[self.order.id]),
            {"status": Order.StatusChoices.DELIVERED},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_can_cancel_pending_order(self):
        self.client.force_authenticate(user=self.client_user)

        response = self.client.patch(
            reverse("orders-detail", args=[self.order.id]),
            {"status": Order.StatusChoices.CANCELLED},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.StatusChoices.CANCELLED)

    def test_other_vendor_cannot_modify_order(self):
        self.client.force_authenticate(user=self.other_vendor)

        response = self.client.patch(
            reverse("orders-detail", args=[self.order.id]),
            {"status": Order.StatusChoices.PREPARING},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_vendor_cannot_cancel_delivered_order(self):
        self.order.status = Order.StatusChoices.DELIVERED
        self.order.save()
        self.client.force_authenticate(user=self.vendor_user)

        response = self.client.patch(
            reverse("orders-detail", args=[self.order.id]),
            {"status": Order.StatusChoices.CANCELLED},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_order_creation_requires_store(self):
        self.client.force_authenticate(user=self.client_user)

        response = self.client.post(
            reverse("orders-list"),
            {"total": "50.00", "status": "pending"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("store", response.data)


class OrderItemViewSetTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.client_user = user_model.objects.create_user(
            username="item-client-user",
            password="testpass123",
            email="item-client@example.com",
            role="cliente",
        )
        self.vendor_user = user_model.objects.create_user(
            username="item-vendor-user",
            password="testpass123",
            email="item-vendor@example.com",
            role="vendedor",
        )
        self.other_vendor = user_model.objects.create_user(
            username="item-other-vendor",
            password="testpass123",
            email="item-other@example.com",
            role="vendedor",
        )
        self.store = Store.objects.create(owner=self.vendor_user, name="Tienda Items A")
        self.other_store = Store.objects.create(owner=self.other_vendor, name="Tienda Items B")
        self.product_a = Product.objects.create(
            store=self.store,
            name="Burger A",
            price=Decimal("20.00"),
            stock=5,
            is_available=True,
        )
        self.product_b = Product.objects.create(
            store=self.other_store,
            name="Burger B",
            price=Decimal("25.00"),
            stock=10,
            is_available=True,
        )
        self.order = Order.objects.create(
            user=self.client_user,
            store=self.store,
            total=Decimal("100.00"),
            status=Order.StatusChoices.PENDING,
        )

    def test_order_item_rejects_quantity_exceeding_stock(self):
        self.client.force_authenticate(user=self.client_user)

        response = self.client.post(
            reverse("order-items-list"),
            {"order": self.order.id, "product": self.product_a.id, "quantity": 10},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("quantity", response.data)

    def test_order_item_rejects_product_from_different_store(self):
        self.client.force_authenticate(user=self.client_user)

        response = self.client.post(
            reverse("order-items-list"),
            {"order": self.order.id, "product": self.product_b.id, "quantity": 1},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)

    def test_order_item_forces_unit_price_from_product(self):
        self.client.force_authenticate(user=self.client_user)

        response = self.client.post(
            reverse("order-items-list"),
            {
                "order": self.order.id,
                "product": self.product_a.id,
                "quantity": 2,
                "unit_price": "0.01",  # Intento de manipulacion
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_item = OrderItem.objects.get(id=response.data["id"])
        self.assertEqual(created_item.unit_price, self.product_a.price)


