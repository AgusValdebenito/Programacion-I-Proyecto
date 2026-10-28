from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import Cart, CartItem, Notification, Order, OrderItem, Product, Store
from core.services import CartService, OrderService


class AvailabilityAndPendingOrderTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.vendor = user_model.objects.create_user(
            username="vendor1",
            password="password123",
            email="vendor1@example.com",
            role="vendedor",
        )
        self.client_user = user_model.objects.create_user(
            username="client1",
            password="password123",
            email="client1@example.com",
            role="cliente",
        )
        self.store = Store.objects.create(
            owner=self.vendor,
            name="Pizzeria Central",
            is_active=True,
        )
        self.product = Product.objects.create(
            store=self.store,
            name="Pizza Fugazzeta",
            price=Decimal("1500.00"),
            is_available=True,
            track_stock=True,
            stock=10,
        )
        # Crear carrito y pedido pendiente
        cart = Cart.objects.create(user=self.client_user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        self.order = OrderService.checkout_cart(self.client_user)
        self.assertEqual(self.order.status, Order.StatusChoices.PENDING)

    def test_vendor_cannot_accept_order_if_product_becomes_unavailable(self):
        # Desactivar disponibilidad del producto
        self.product.is_available = False
        self.product.save(update_fields=["is_available"])

        self.client.force_authenticate(user=self.vendor)
        url = reverse("orders-detail", args=[self.order.id])
        response = self.client.patch(url, {"status": "preparing"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("no disponibles actualmente", str(response.data))

        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.StatusChoices.PENDING)

    def test_vendor_cannot_accept_order_if_product_is_soft_deleted(self):
        self.product.is_deleted = True
        self.product.save(update_fields=["is_deleted"])

        self.client.force_authenticate(user=self.vendor)
        url = reverse("orders-detail", args=[self.order.id])
        response = self.client.patch(url, {"status": "preparing"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.StatusChoices.PENDING)

    def test_vendor_cannot_accept_order_if_store_is_suspended(self):
        self.store.is_active = False
        self.store.save(update_fields=["is_active"])

        self.client.force_authenticate(user=self.vendor)
        url = reverse("orders-detail", args=[self.order.id])
        response = self.client.patch(url, {"status": "preparing"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("suspendida", str(response.data))


class AdminModerationAutoCancellationTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.admin = user_model.objects.create_superuser(
            username="admin1",
            password="password123",
            email="admin1@example.com",
            role="admin",
        )
        self.vendor = user_model.objects.create_user(
            username="vendor2",
            password="password123",
            email="vendor2@example.com",
            role="vendedor",
        )
        self.client_user = user_model.objects.create_user(
            username="client2",
            password="password123",
            email="client2@example.com",
            role="cliente",
        )
        self.store = Store.objects.create(
            owner=self.vendor,
            name="Burger House",
            is_active=True,
        )
        self.prod_a = Product.objects.create(
            store=self.store,
            name="Hamburguesa Doble",
            price=Decimal("2000.00"),
            is_available=True,
            track_stock=True,
            stock=10,
        )
        self.prod_b = Product.objects.create(
            store=self.store,
            name="Papas Fritas",
            price=Decimal("800.00"),
            is_available=True,
            track_stock=True,
            stock=15,
        )

    def test_admin_suspending_store_auto_cancels_pending_orders_and_restores_stock(self):
        # Checkout: 2 hamburguesas (stock baja a 8), 1 papas (stock baja a 14)
        cart = Cart.objects.create(user=self.client_user)
        CartItem.objects.create(cart=cart, product=self.prod_a, quantity=2)
        CartItem.objects.create(cart=cart, product=self.prod_b, quantity=1)
        order = OrderService.checkout_cart(self.client_user)

        self.prod_a.refresh_from_db()
        self.prod_b.refresh_from_db()
        self.assertEqual(self.prod_a.stock, 8)
        self.assertEqual(self.prod_b.stock, 14)

        # Admin suspende la tienda
        self.client.force_authenticate(user=self.admin)
        url = reverse("stores-detail", args=[self.store.id])
        res = self.client.patch(url, {"is_active": False})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Verificar pedido cancelado
        order.refresh_from_db()
        self.assertEqual(order.status, Order.StatusChoices.CANCELLED)
        self.assertIn("suspendida por administración", order.cancellation_reason)

        # Verificar reintegro de stock
        self.prod_a.refresh_from_db()
        self.prod_b.refresh_from_db()
        self.assertEqual(self.prod_a.stock, 10)
        self.assertEqual(self.prod_b.stock, 15)

        # Verificar notificaciones creadas
        client_notif = Notification.objects.filter(user=self.client_user).first()
        self.assertIsNotNone(client_notif)
        self.assertEqual(client_notif.notification_type, Notification.NotificationType.ORDER_CANCELLED)

        vendor_notif = Notification.objects.filter(user=self.vendor).first()
        self.assertIsNotNone(vendor_notif)
        self.assertEqual(vendor_notif.notification_type, Notification.NotificationType.STORE_MODERATION)

    def test_admin_disabling_product_auto_cancels_pending_orders_and_restores_other_items_stock(self):
        cart = Cart.objects.create(user=self.client_user)
        CartItem.objects.create(cart=cart, product=self.prod_a, quantity=1)
        CartItem.objects.create(cart=cart, product=self.prod_b, quantity=2)
        order = OrderService.checkout_cart(self.client_user)

        self.prod_b.refresh_from_db()
        self.assertEqual(self.prod_b.stock, 13)

        # Admin pausa prod_a
        self.client.force_authenticate(user=self.admin)
        url = reverse("products-detail", args=[self.prod_a.id])
        res = self.client.patch(url, {"is_available": False})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Pedido cancelado
        order.refresh_from_db()
        self.assertEqual(order.status, Order.StatusChoices.CANCELLED)
        self.assertIn(self.prod_a.name, order.cancellation_reason)

        # Stock de prod_b restaurado
        self.prod_b.refresh_from_db()
        self.assertEqual(self.prod_b.stock, 15)

        # Notificación al cliente y a la tienda
        self.assertTrue(Notification.objects.filter(user=self.client_user).exists())
        self.assertTrue(Notification.objects.filter(user=self.vendor).exists())

    def test_cart_item_removed_and_notified_when_admin_suspends_product(self):
        # Cliente tiene prod_a en su carrito sin pagar todavía
        cart = Cart.objects.create(user=self.client_user)
        CartItem.objects.create(cart=cart, product=self.prod_a, quantity=1)

        # Admin pausa el producto
        self.client.force_authenticate(user=self.admin)
        url = reverse("products-detail", args=[self.prod_a.id])
        self.client.patch(url, {"is_available": False})

        # Carrito vacío
        self.assertEqual(cart.items.count(), 0)

        # Notificación de carrito retirada
        notif = Notification.objects.filter(
            user=self.client_user,
            notification_type=Notification.NotificationType.CART_UPDATE,
        ).first()
        self.assertIsNotNone(notif)
        self.assertIn("ya no se encuentra disponible", notif.message)


class ProductSoftDeleteAndSnapshotTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.vendor = user_model.objects.create_user(
            username="vendor3",
            password="password123",
            email="vendor3@example.com",
            role="vendedor",
        )
        self.client_user = user_model.objects.create_user(
            username="client3",
            password="password123",
            email="client3@example.com",
            role="cliente",
        )
        self.store = Store.objects.create(owner=self.vendor, name="Pastas Nonna")
        self.product = Product.objects.create(
            store=self.store,
            name="Ravioles con Salsa Bolognesa",
            price=Decimal("3000.00"),
            is_available=True,
        )

    def test_product_with_order_history_is_soft_deleted_instead_of_crashing(self):
        # Crear pedido y marcarlo como entregado
        cart = Cart.objects.create(user=self.client_user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        order = OrderService.checkout_cart(self.client_user)
        order.status = Order.StatusChoices.DELIVERED
        order.save()

        # Dueño o admin intenta eliminar el producto
        self.client.force_authenticate(user=self.vendor)
        url = reverse("products-detail", args=[self.product.id])
        res = self.client.delete(url)

        # No debe dar 500 ProtectedError; debe responder 204
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

        # El producto sigue existiendo en DB pero marcado como is_deleted=True
        self.product.refresh_from_db()
        self.assertTrue(self.product.is_deleted)
        self.assertFalse(self.product.is_available)

        # El listado público de productos no lo devuelve
        list_res = self.client.get(reverse("products-list"))
        self.assertFalse(any(p["id"] == self.product.id for p in list_res.data))

        # El pedido histórico conserva el item y el snapshot de nombre
        order_res = self.client.get(reverse("orders-detail", args=[order.id]))
        item = order_res.data["items"][0]
        self.assertEqual(item["product_name"], "Ravioles con Salsa Bolognesa")

    def test_order_item_snapshot_preserves_name_even_if_product_is_renamed(self):
        cart = Cart.objects.create(user=self.client_user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        order = OrderService.checkout_cart(self.client_user)

        item = order.items.first()
        self.assertEqual(item.product_name, "Ravioles con Salsa Bolognesa")

        # Renombrar el producto en el catálogo
        self.product.name = "Ravioles de Calabaza"
        self.product.save(update_fields=["name"])

        # El snapshot del pedido previo se mantiene inmutable
        self.client.force_authenticate(user=self.client_user)
        order_res = self.client.get(reverse("orders-detail", args=[order.id]))
        self.assertEqual(order_res.data["items"][0]["product_name"], "Ravioles con Salsa Bolognesa")


class NotificationApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username="notifuser",
            password="password123",
            email="notif@example.com",
            role="cliente",
        )
        self.notif1 = Notification.objects.create(
            user=self.user,
            title="Aviso 1",
            message="Contenido 1",
            is_read=False,
        )
        self.notif2 = Notification.objects.create(
            user=self.user,
            title="Aviso 2",
            message="Contenido 2",
            is_read=False,
        )

    def test_list_notifications_and_mark_read(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("notifications-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)

        # Marcar una como leída
        read_url = reverse("notifications-mark-as-read", args=[self.notif1.id])
        read_res = self.client.post(read_url)
        self.assertEqual(read_res.status_code, status.HTTP_200_OK)

        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_read)

        # Marcar todas como leídas
        all_read_url = reverse("notifications-mark-all-as-read")
        all_read_res = self.client.post(all_read_url)
        self.assertEqual(all_read_res.status_code, status.HTTP_200_OK)

        self.notif2.refresh_from_db()
        self.assertTrue(self.notif2.is_read)
