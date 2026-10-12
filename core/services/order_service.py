from rest_framework.exceptions import PermissionDenied, ValidationError

from core.models import Order
from core.permissions import is_admin_user


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
    def transition_status(cls, order, new_status, user):
        """Valida y aplica la transicion de estados de un pedido segun el rol del usuario."""
        if new_status == order.status:
            return order

        is_admin = is_admin_user(user)
        is_vendor = order.store.owner == user
        is_client = order.user == user

        if is_admin:
            order.status = new_status
            order.save(update_fields=["status"])
            return order

        if is_client and not is_vendor:
            # Los clientes solo pueden cancelar pedidos que aun se encuentren pendientes
            if new_status == Order.StatusChoices.CANCELLED:
                if order.status != Order.StatusChoices.PENDING:
                    raise ValidationError({"detail": "Solo podes cancelar pedidos en estado 'Pendiente'."})
                order.status = Order.StatusChoices.CANCELLED
                order.save(update_fields=["status"])
                return order
            raise PermissionDenied("Los clientes solo pueden consultar o cancelar sus pedidos pendientes.")

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
        """Valida disponibilidad, stock y mono-tienda para items de pedido y descuenta el stock."""
        if order.user != user and not is_admin_user(user):
            raise PermissionDenied("Solo podes agregar items a tus propios pedidos.")

        if quantity < 1:
            raise ValidationError({"quantity": "La cantidad debe ser mayor o igual a 1."})

        if not product.is_available:
            raise ValidationError({"product": "Este producto no se encuentra disponible."})

        if product.stock < quantity:
            raise ValidationError({
                "quantity": f"Stock insuficiente para '{product.name}'. Stock disponible: {product.stock}."
            })

        if product.store != order.store:
            raise ValidationError({
                "detail": f"El producto '{product.name}' pertenece a otra tienda y no puede agregarse a este pedido."
            })

        # Descontar stock disponible del producto
        product.stock -= quantity
        product.save(update_fields=["stock"])

        # Retornar el precio unitario del producto para congelarlo en el item
        return product.price

    @classmethod
    def checkout_cart(cls, user):
        """Convierte atómicamente el carrito activo en un pedido, congelando precios y descontando stock."""
        from decimal import Decimal
        from django.db import transaction
        from core.models import Cart, OrderItem, Product

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

        with transaction.atomic():
            # Bloquear productos para evitar condiciones de carrera (overselling)
            product_ids = [item.product.id for item in cart_items]
            locked_products = {
                p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)
            }

            # Validar disponibilidad y stock sobre las filas bloqueadas
            total = Decimal("0.00")
            for item in cart_items:
                product = locked_products.get(item.product.id)
                if not product or not product.is_available:
                    raise ValidationError({
                        "detail": f"El producto '{item.product.name}' ya no se encuentra disponible."
                    })
                if product.stock < item.quantity:
                    raise ValidationError({
                        "detail": f"Stock insuficiente para '{product.name}'. Stock disponible: {product.stock}."
                    })
                total += product.price * item.quantity

            # Crear la orden
            order = Order.objects.create(
                user=user,
                store=store,
                total=total,
                status=Order.StatusChoices.PENDING,
            )

            # Crear OrderItems con precio congelado y descontar stock
            for item in cart_items:
                product = locked_products[item.product.id]
                product.stock -= item.quantity
                product.save(update_fields=["stock"])

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item.quantity,
                    unit_price=product.price,
                )

            # Vaciar el carrito
            cart.items.all().delete()

            return order
