from rest_framework.exceptions import PermissionDenied, ValidationError

from core.models import Order, Product
from core.permissions import is_admin_user
from users.models import Usuario


class OrderService:
    """Capa de servicio que encapsula las reglas de negocio y transiciones de pedidos."""

    ALLOWED_TRANSITIONS = {
        Order.StatusChoices.PENDING: [Order.StatusChoices.PREPARING, Order.StatusChoices.CANCELLED],
        Order.StatusChoices.PREPARING: [Order.StatusChoices.DELIVERING, Order.StatusChoices.CANCELLED],
        Order.StatusChoices.DELIVERING: [Order.StatusChoices.DELIVERED],
        Order.StatusChoices.DELIVERED: [],
        Order.StatusChoices.CANCELLED: [],
    }

    @classmethod
    def restore_order_stock(cls, order, excluded_product_id=None):
        """Reintegra el stock de los productos con track_stock al cancelar un pedido."""
        for item in order.items.select_related("product").all():
            prod = item.product
            if prod.track_stock:
                prod.stock += item.quantity
                if excluded_product_id is None or prod.id != excluded_product_id:
                    if not prod.is_available and prod.stock > 0:
                        prod.is_available = True
                        prod.save(update_fields=["stock", "is_available"])
                    else:
                        prod.save(update_fields=["stock"])
                else:
                    prod.save(update_fields=["stock"])

    @classmethod
    def reject_order_by_vendor(cls, order, user, reason=None, out_of_stock_product=None):
        """Cancela un pedido por parte del comercio o admin, registrando motivo y apagando reactivamente el plato agotado."""
        is_admin = is_admin_user(user)
        is_vendor = order.store.owner == user

        if not (is_admin or is_vendor):
            raise PermissionDenied("No tenes permisos para rechazar pedidos de este comercio.")

        if order.status in [Order.StatusChoices.DELIVERED, Order.StatusChoices.CANCELLED]:
            raise ValidationError({
                "detail": f"No podés cancelar un pedido que ya se encuentra en estado '{order.get_status_display()}'."
            })

        order.status = Order.StatusChoices.CANCELLED
        order.cancellation_reason = reason or "Cancelado por el comercio"

        prod_id = None
        if out_of_stock_product is not None:
            if isinstance(out_of_stock_product, Product):
                prod = out_of_stock_product
                if prod.store_id != order.store_id:
                    raise ValidationError({
                        "out_of_stock_product": "El producto especificado no pertenece a la tienda de este pedido."
                    })
            else:
                prod = Product.objects.filter(id=out_of_stock_product, store=order.store).first()
                if not prod:
                    raise ValidationError({
                        "out_of_stock_product": "El producto especificado no pertenece a la tienda de este pedido."
                    })

            order.cancelled_product = prod
            prod_id = prod.id
            # Desactivación reactiva automática del plato/producto que originó la falta de stock
            prod.is_available = False
            prod.save(update_fields=["is_available"])

        cls.restore_order_stock(order, excluded_product_id=prod_id)
        order.save(update_fields=["status", "cancellation_reason", "cancelled_product"])
        return order

    @classmethod
    def transition_status(cls, order, new_status, user, cancellation_reason=None, cancelled_product=None):
        """Valida y aplica la transicion de estados de un pedido segun el rol del usuario."""
        if new_status == order.status:
            return order

        is_admin = is_admin_user(user)
        is_vendor = order.store.owner == user
        is_client = order.user == user

        if new_status == Order.StatusChoices.CANCELLED:
            if is_vendor or is_admin:
                return cls.reject_order_by_vendor(
                    order=order,
                    user=user,
                    reason=cancellation_reason,
                    out_of_stock_product=cancelled_product,
                )
            if is_client:
                if order.status != Order.StatusChoices.PENDING:
                    raise ValidationError({"detail": "Solo podes cancelar pedidos en estado 'Pendiente'."})
                order.status = Order.StatusChoices.CANCELLED
                order.cancellation_reason = cancellation_reason or "Cancelado por el cliente"
                cls.restore_order_stock(order)
                order.save(update_fields=["status", "cancellation_reason"])
                return order
            raise PermissionDenied("No tenes permisos para cancelar este pedido.")

        if is_admin:
            if new_status == Order.StatusChoices.CANCELLED and order.status != Order.StatusChoices.CANCELLED:
                cls.restore_order_stock(order)
            order.status = new_status
            order.save(update_fields=["status"])
            return order

        if is_client and not is_vendor:
            raise PermissionDenied("Los clientes solo pueden consultar o cancelar sus pedidos pendientes.")

        if is_vendor or is_admin:
            if new_status == Order.StatusChoices.PREPARING:
                if not order.store.is_active:
                    raise ValidationError({
                        "detail": "No podés aceptar pedidos porque la tienda se encuentra actualmente suspendida."
                    })
                unavailable_items = [
                    item.product.name if item.product else item.product_name
                    for item in order.items.select_related("product").all()
                    if not item.product or not item.product.is_available or getattr(item.product, "is_deleted", False)
                ]
                if unavailable_items:
                    items_str = ", ".join(f"'{name}'" for name in unavailable_items)
                    raise ValidationError({
                        "detail": (
                            f"No podés aceptar este pedido porque incluye productos no disponibles actualmente: {items_str}. "
                            "Rechazá el pedido o reactivá el producto si volvés a tener disponibilidad."
                        )
                    })

        if is_vendor:
            allowed = cls.ALLOWED_TRANSITIONS.get(order.status, [])
            if new_status not in allowed:
                raise ValidationError({
                    "detail": f"Transicion de estado no valida de '{order.status}' a '{new_status}'."
                })
            order.status = new_status
            order.save(update_fields=["status"])
            return order

        raise PermissionDenied("No tenes permisos para modificar este pedido.")

    @staticmethod
    def validate_and_prepare_item(order, product, quantity, user):
        """Valida disponibilidad, stock y mono-tienda para items de pedido y descuenta el stock si track_stock es True."""
        if order.user != user and not is_admin_user(user):
            raise PermissionDenied("Solo podes agregar items a tus propios pedidos.")

        if quantity < 1:
            raise ValidationError({"quantity": "La cantidad debe ser mayor o igual a 1."})

        if not product.is_available:
            raise ValidationError({"product": "Este producto no se encuentra disponible."})

        # Regla de Stock Híbrido: solo validar y descontar si el producto controla stock numérico
        if product.track_stock:
            if product.stock < quantity:
                raise ValidationError({
                    "quantity": f"Stock insuficiente para '{product.name}'. Stock disponible: {product.stock}."
                })
            product.stock -= quantity
            if product.stock == 0:
                product.is_available = False
                product.save(update_fields=["stock", "is_available"])
            else:
                product.save(update_fields=["stock"])

        if product.store != order.store:
            raise ValidationError({
                "detail": f"El producto '{product.name}' pertenece a otra tienda y no puede agregarse a este pedido."
            })

        # Retornar el precio unitario del producto para congelarlo en el item
        return product.price

    @classmethod
    def checkout_cart(
        cls,
        user,
        delivery_address=None,
        delivery_phone=None,
        delivery_notes=None,
        payment_method=None,
    ):
        """Convierte atómicamente el carrito activo en un pedido, congelando precios y descontando stock."""
        if not (is_admin_user(user) or getattr(user, "role", None) == Usuario.RoleChoices.CLIENTE):
            raise PermissionDenied(
                "Los vendedores no pueden realizar pedidos. Esta acción está reservada para clientes y administradores."
            )

        from decimal import Decimal
        from django.db import transaction
        from core.models import Cart, Order, OrderItem, Product

        with transaction.atomic():
            # Bloquear el carrito para evitar checkouts concurrentes simultáneos (doble orden)
            cart = Cart.objects.select_for_update().filter(user=user).first()
            if not cart:
                cart, _ = Cart.objects.get_or_create(user=user)

            cart_items = list(cart.items.select_related("product__store").all())

            if not cart_items:
                raise ValidationError({"detail": "No podés realizar el checkout con un carrito vacío."})

            # Regla mono-tienda: todos los productos deben pertenecer al mismo local
            store = cart_items[0].product.store
            for item in cart_items:
                if item.product.store != store:
                    raise ValidationError({
                        "detail": "El carrito contiene productos de diferentes comercios."
                    })

            # Bloquear productos para evitar condiciones de carrera (overselling)
            product_ids = [item.product.id for item in cart_items]
            locked_products = {
                p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)
            }

            # Validar disponibilidad en caliente sobre las filas bloqueadas
            unavailable_products = []
            for item in cart_items:
                product = locked_products.get(item.product.id)
                if not product or not product.is_available or getattr(product, "is_deleted", False):
                    unavailable_products.append(item.product)

            if unavailable_products:
                names = ", ".join(f"'{p.name}'" for p in unavailable_products)
                raise ValidationError({
                    "error": "PRODUCT_UNAVAILABLE",
                    "detail": (
                        f"El producto {names} se agotó recientemente o ya no se encuentra disponible. "
                        "Por favor, eliminalo de tu carrito para continuar."
                    ),
                    "unavailable_product_ids": [p.id for p in unavailable_products],
                })

            total = Decimal("0.00")
            for item in cart_items:
                product = locked_products[item.product.id]
                if product.track_stock and product.stock < item.quantity:
                    raise ValidationError({
                        "detail": f"Stock insuficiente para '{product.name}'. Stock disponible: {product.stock}."
                    })
                total += product.price * item.quantity

            # Crear la orden con datos de entrega
            order = Order.objects.create(
                user=user,
                store=store,
                total=total,
                status=Order.StatusChoices.PENDING,
                delivery_address=delivery_address,
                delivery_phone=delivery_phone,
                delivery_notes=delivery_notes,
                payment_method=payment_method,
            )

            # Crear OrderItems con precio congelado y descontar stock si track_stock es True
            for item in cart_items:
                product = locked_products[item.product.id]
                if product.track_stock:
                    product.stock -= item.quantity
                    if product.stock == 0:
                        product.is_available = False
                        product.save(update_fields=["stock", "is_available"])
                    else:
                        product.save(update_fields=["stock"])

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    quantity=item.quantity,
                    unit_price=product.price,
                )

            # Vaciar el carrito
            cart.items.all().delete()

            return order

    @classmethod
    def cancel_pending_orders_for_store(cls, store, reason=None):
        """Cancela automáticamente todos los pedidos pendientes de una tienda suspendida/eliminada y reintegra stock."""
        from core.services.notification_service import NotificationService
        pending_orders = Order.objects.filter(store=store, status=Order.StatusChoices.PENDING)
        cancelled_count = 0
        reason_text = reason or "Cancelado automáticamente: la tienda fue suspendida por administración."
        for order in pending_orders:
            cls.restore_order_stock(order)
            order.status = Order.StatusChoices.CANCELLED
            order.cancellation_reason = reason_text
            order.save(update_fields=["status", "cancellation_reason"])
            NotificationService.notify_order_cancelled(order, reason_text)
            cancelled_count += 1
        return cancelled_count

    @classmethod
    def cancel_pending_orders_for_product(cls, product, reason=None):
        """Cancela automáticamente pedidos pendientes que incluyan un producto desactivado/eliminado."""
        from core.services.notification_service import NotificationService
        pending_orders = Order.objects.filter(
            items__product=product, status=Order.StatusChoices.PENDING
        ).distinct()
        cancelled_count = 0
        reason_text = reason or f"Cancelado automáticamente: el producto '{product.name}' fue dado de baja o suspendido."
        for order in pending_orders:
            cls.restore_order_stock(order, excluded_product_id=product.id)
            order.status = Order.StatusChoices.CANCELLED
            order.cancelled_product = product
            order.cancellation_reason = reason_text
            order.save(update_fields=["status", "cancellation_reason", "cancelled_product"])
            NotificationService.notify_order_cancelled(order, reason_text)
            cancelled_count += 1
        return cancelled_count
