from core.models import Notification


class NotificationService:
    """Servicio para la generacion y gestion de notificaciones a usuarios, tiendas y clientes."""

    @classmethod
    def create_notification(
        cls,
        user,
        title,
        message,
        notification_type=Notification.NotificationType.SYSTEM,
        link=None,
    ):
        if not user:
            return None
        return Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            link=link or "",
        )

    @classmethod
    def notify_store_moderation(cls, store, action, detail=None):
        """Notifica al propietario de la tienda cuando un admin suspende, reactiva o elimina su comercio."""
        if not store or not store.owner:
            return None

        if action == "suspended":
            title = f"Tu tienda '{store.name}' fue suspendida"
            message = (
                detail
                or f"La tienda '{store.name}' fue suspendida por moderacion. "
                "Los pedidos pendientes asociados han sido cancelados automaticamente."
            )
            link = "/panel-tienda"
        elif action == "reactivated":
            title = f"Tu tienda '{store.name}' fue reactivada"
            message = (
                detail
                or f"La tienda '{store.name}' ha sido reactivada por administracion y vuelve a estar visible al publico."
            )
            link = "/panel-tienda"
        elif action == "deleted":
            title = f"Tu tienda '{store.name}' fue eliminada"
            message = detail or f"La tienda '{store.name}' fue eliminada por administracion."
            link = "/"
        else:
            title = f"Actualizacion sobre tu tienda '{store.name}'"
            message = detail or f"Se registro una accion administrativa sobre '{store.name}'."
            link = "/panel-tienda"

        return cls.create_notification(
            user=store.owner,
            title=title,
            message=message,
            notification_type=Notification.NotificationType.STORE_MODERATION,
            link=link,
        )

    @classmethod
    def notify_product_moderation(cls, product, action, detail=None):
        """Notifica al comercio cuando un admin suspende, pausa o elimina un producto."""
        if not product or not product.store or not product.store.owner:
            return None

        if action == "suspended":
            title = f"Producto '{product.name}' pausado por moderacion"
            message = (
                detail
                or f"El producto '{product.name}' fue pausado por administracion. "
                "Cualquier pedido pendiente que lo incluia ha sido cancelado automaticamente."
            )
        elif action == "deleted":
            title = f"Producto '{product.name}' eliminado por moderacion"
            message = (
                detail
                or f"El producto '{product.name}' fue eliminado del catalogo por administracion. "
                "Los pedidos pendientes asociados fueron cancelados."
            )
        else:
            title = f"Aviso sobre tu producto '{product.name}'"
            message = detail or f"Se registro una accion administrativa sobre '{product.name}'."

        return cls.create_notification(
            user=product.store.owner,
            title=title,
            message=message,
            notification_type=Notification.NotificationType.PRODUCT_MODERATION,
            link="/panel-tienda",
        )

    @classmethod
    def notify_order_cancelled(cls, order, reason=None):
        """Notifica al cliente que su pedido fue cancelado."""
        if not order or not order.user:
            return None

        title = f"Pedido #{order.id} cancelado"
        message = reason or "Tu pedido fue cancelado."
        return cls.create_notification(
            user=order.user,
            title=title,
            message=message,
            notification_type=Notification.NotificationType.ORDER_CANCELLED,
            link="/pedidos",
        )

    @classmethod
    def notify_cart_item_removed(cls, user, product, reason=None):
        """Notifica al cliente que un producto que tenia en su carrito fue retirado antes de pagar."""
        if not user or not product:
            return None

        store_name = product.store.name if getattr(product, "store", None) else "el comercio"
        title = "Producto retirado de tu carrito"
        message = (
            reason
            or f"El producto '{product.name}' de '{store_name}' ya no se encuentra disponible "
            "o fue retirado por moderacion, por lo que fue quitado de tu pedido en curso."
        )
        return cls.create_notification(
            user=user,
            title=title,
            message=message,
            notification_type=Notification.NotificationType.CART_UPDATE,
            link="/carrito",
        )
