from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Cart, CartItem, Order, OrderItem, Product, Store
from .serializers import OrderSerializer


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

    def test_search_products_by_name_and_description(self):
        Product.objects.create(
            store=self.store,
            name="Ensalada Caesar",
            description="Lechuga y pollo",
            price=Decimal("8.00"),
        )
        response = self.client.get(reverse("products-list") + "?search=Hamburguesa")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Hamburguesa")

        response_desc = self.client.get(reverse("products-list") + "?search=pollo")
        self.assertEqual(response_desc.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_desc.data), 1)
        self.assertEqual(response_desc.data[0]["name"], "Ensalada Caesar")

    def test_filter_products_by_store(self):
        user_model = get_user_model()
        other_owner = user_model.objects.create_user(
            username="other-store-owner",
            password="testpass123",
            email="other-owner@example.com",
            role="vendedor",
        )
        other_store = Store.objects.create(owner=other_owner, name="Segunda Tienda")
        Product.objects.create(
            store=other_store,
            name="Empanada de Carne",
            price=Decimal("5.00"),
            stock=10,
        )

        response = self.client.get(reverse("products-list") + f"?store={self.store.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.product.id)
        self.assertEqual(response.data[0]["store"], self.store.id)

    def test_update_product_with_image_url_string_succeeds(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.patch(
            reverse("products-detail", args=[self.product.id]),
            {
                "name": "Hamburguesa Modificada",
                "price": "67.00",
                "description": "para farmear aura con tus amigos",
                "image": "http://testserver/media/products/fake.jpg",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.price, Decimal("67.00"))
        self.assertEqual(self.product.description, "para farmear aura con tus amigos")


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

    def test_create_cart_item_fails_when_exceeding_max_quantity(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            reverse("cart-items-list"),
            {"cart": self.cart.id, "product": self.product.id, "quantity": 11},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("quantity", response.data)

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

    def test_get_active_cart_returns_items_and_product_details(self):
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse("carts-active"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["items"]), 1)
        item = response.data["items"][0]
        self.assertEqual(item["product"], self.product.id)
        self.assertEqual(item["quantity"], 2)
        self.assertEqual(item["product_details"]["name"], "Pizza")

    def test_clear_cart_action_removes_all_cart_items(self):
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=3)
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(reverse("carts-clear"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CartItem.objects.filter(cart=self.cart).count(), 0)

    def test_checkout_fails_with_empty_cart(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(reverse("carts-checkout"), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)

    def test_checkout_atomic_success_creates_order_deducts_stock_and_clears_cart(self):
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)
        self.client.force_authenticate(user=self.user)

        initial_stock = self.product.stock  # 10
        response = self.client.post(reverse("carts-checkout"), {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertEqual(Decimal(str(response.data["total"])), Decimal("30.00"))
        self.assertEqual(response.data["status"], "pending")

        # Verifica que el producto haya descontado su stock
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, initial_stock - 2)

        # Verifica que los items del carrito se hayan vaciado
        self.assertEqual(CartItem.objects.filter(cart=self.cart).count(), 0)

        # Verifica la orden y sus OrderItems en la BD
        order = Order.objects.get(id=response.data["id"])
        self.assertEqual(order.user, self.user)
        self.assertEqual(order.store, self.store)
        self.assertEqual(order.items.count(), 1)
        order_item = order.items.first()
        self.assertEqual(order_item.product, self.product)
        self.assertEqual(order_item.quantity, 2)
        self.assertEqual(order_item.unit_price, Decimal("15.00"))

    def test_checkout_fails_when_product_stock_is_insufficient(self):
        # Solicitamos 15 cuando el stock es 10
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=15)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(reverse("carts-checkout"), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)

        # Ninguna orden debe crearse
        self.assertEqual(Order.objects.filter(user=self.user).count(), 0)
        # El carrito no debe borrarse
        self.assertEqual(CartItem.objects.filter(cart=self.cart).count(), 1)
        # El stock no debe alterarse
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)

    def test_checkout_fails_when_product_is_unavailable(self):
        self.product.is_available = False
        self.product.save(update_fields=["is_available"])
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=1)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(reverse("carts-checkout"), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)

        # Ninguna orden creada y stock inalterado
        self.assertEqual(Order.objects.filter(user=self.user).count(), 0)
        self.assertEqual(CartItem.objects.filter(cart=self.cart).count(), 1)

    def test_checkout_forbidden_for_vendor_user(self):
        vendor_cart = Cart.objects.create(user=self.store_owner)
        CartItem.objects.create(cart=vendor_cart, product=self.product, quantity=1)
        self.client.force_authenticate(user=self.store_owner)

        response = self.client.post(reverse("carts-checkout"), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("detail", response.data)
        self.assertEqual(Order.objects.filter(user=self.store_owner).count(), 0)

    def test_checkout_allowed_for_admin_user(self):
        user_model = get_user_model()
        admin_user = user_model.objects.create_user(
            username="admin-cart-user",
            password="testpass123",
            email="admin-cart@example.com",
            role="admin",
            is_staff=True,
        )
        admin_cart = Cart.objects.create(user=admin_user)
        CartItem.objects.create(cart=admin_cart, product=self.product, quantity=1)
        self.client.force_authenticate(user=admin_user)

        response = self.client.post(reverse("carts-checkout"), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.filter(user=admin_user).count(), 1)


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

    def test_direct_order_creation_rejected(self):
        self.client.force_authenticate(user=self.client_user)

        response = self.client.post(
            reverse("orders-list"),
            {"store": self.store.id, "total": "50.00", "status": "pending"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("checkout", response.data["detail"])

    def test_order_creation_forbidden_for_vendor(self):
        self.client.force_authenticate(user=self.vendor_user)

        response = self.client.post(
            reverse("orders-list"),
            {"store": self.store.id, "total": "50.00", "status": "pending"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("detail", response.data)

    def test_order_serializer_read_only_fields(self):
        serializer = OrderSerializer()
        for field in ["user", "created_at", "store", "total", "status"]:
            self.assertIn(field, serializer.Meta.read_only_fields)


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

    def test_order_item_creation_reduces_product_stock(self):
        self.client.force_authenticate(user=self.client_user)
        initial_stock = self.product_a.stock

        response = self.client.post(
            reverse("order-items-list"),
            {
                "order": self.order.id,
                "product": self.product_a.id,
                "quantity": 3,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product_a.refresh_from_db()
        self.assertEqual(self.product_a.stock, initial_stock - 3)


class TiendaYPedidosVendedorFilterTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.vendedor = user_model.objects.create_user(
            username="vendedor_test",
            email="vendedor_test@test.com",
            password="password123",
            role="vendedor",
        )
        self.cliente = user_model.objects.create_user(
            username="cliente_test",
            email="cliente_test@test.com",
            password="password123",
            role="cliente",
        )
        self.store = Store.objects.create(
            owner=self.vendedor,
            name="Pizzeria Don Vendedor",
            description="Las mejores pizzas",
        )
        self.product = Product.objects.create(
            store=self.store,
            name="Pizza Fugazzeta",
            price=Decimal("1200.00"),
            stock=10,
        )

    def test_my_store_returns_vendor_store(self):
        self.client.force_authenticate(user=self.vendedor)
        url = reverse("stores-my-store")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.store.id)
        self.assertEqual(response.data["name"], "Pizzeria Don Vendedor")

    def test_my_store_returns_404_when_user_has_no_store(self):
        self.client.force_authenticate(user=self.cliente)
        url = reverse("stores-my-store")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_filter_orders_by_store(self):
        order1 = Order.objects.create(user=self.cliente, store=self.store, total=Decimal("1200.00"))
        otro_vendedor = get_user_model().objects.create_user(
            username="vendedor_dos",
            email="vendedor_dos@test.com",
            password="password123",
            role="vendedor",
        )
        other_store = Store.objects.create(owner=otro_vendedor, name="Sushi Bar")
        Order.objects.create(user=self.cliente, store=other_store, total=Decimal("2500.00"))

        self.client.force_authenticate(user=self.cliente)
        response = self.client.get(reverse("orders-list") + f"?store={self.store.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], order1.id)
