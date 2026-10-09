from rest_framework.exceptions import PermissionDenied, ValidationError

from core.models import CartItem
from core.permissions import is_admin_user


class CartService:
    """Capa de servicio que encapsula las reglas de negocio del carrito de compras."""

    @staticmethod
    def add_item_to_cart(cart, product, quantity, user):
        """Valida e incorpora un producto al carrito respetando stock, disponibilidad y mono-tienda."""
        if cart.user != user and not is_admin_user(user):
            raise PermissionDenied("Solo podes agregar items a tu propio carrito.")

        if quantity < 1:
            raise ValidationError({"quantity": "La cantidad debe ser mayor o igual a 1."})

        if not product.is_available:
            raise ValidationError({"product": "Este producto no se encuentra disponible actualmente."})

        existing_item = CartItem.objects.filter(cart=cart, product=product).first()
        total_requested = (existing_item.quantity if existing_item else 0) + quantity

        if product.stock < total_requested:
            raise ValidationError({
                "quantity": f"Stock insuficiente para '{product.name}'. Stock disponible: {product.stock}."
            })

        # Regla de negocio mono-tienda: un carrito solo puede contener articulos de un mismo comercio
        existing_items = CartItem.objects.filter(cart=cart).select_related("product__store")
        if existing_items.exists():
            current_store = existing_items.first().product.store
            if product.store != current_store:
                raise ValidationError({
                    "detail": (
                        f"No podes agregar productos de '{product.store.name}' porque ya tenes items "
                        f"de '{current_store.name}' en tu carrito. Vacia el carrito para cambiar de tienda."
                    )
                })

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save(update_fields=["quantity"])

        return cart_item, created
