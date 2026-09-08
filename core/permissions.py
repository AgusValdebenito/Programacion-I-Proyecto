from rest_framework import permissions

from users.models import Usuario

from .models import Cart, CartItem, Order, OrderItem, Product, Store


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Usuario.RoleChoices.ADMIN


class IsVendedor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Usuario.RoleChoices.VENDEDOR


class IsAdminOrVendedor(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role in (Usuario.RoleChoices.ADMIN, Usuario.RoleChoices.VENDEDOR)


class IsCliente(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Usuario.RoleChoices.CLIENTE


class IsOrderParticipantOrAdmin(permissions.BasePermission):
    """
    Permite acceso al creador del pedido (cliente), al dueño de la tienda receptora (vendedor) o admin.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.role == Usuario.RoleChoices.ADMIN:
            return True

        # Obj puede ser Order o OrderItem
        order = obj if isinstance(obj, Order) else obj.order

        # Es el cliente creador
        if order.user == request.user:
            return True

        # Es el vendedor dueño de la tienda del pedido
        if order.store and order.store.owner == request.user:
            return True

        return False


class IsResourceOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.user.is_staff:
            return True

        owner = None
        if isinstance(obj, Store):
            owner = obj.owner
        elif isinstance(obj, Product):
            owner = obj.store.owner
        elif isinstance(obj, Cart):
            owner = obj.user
        elif isinstance(obj, CartItem):
            owner = obj.cart.user
        elif isinstance(obj, Order):
            owner = obj.user
        elif isinstance(obj, OrderItem):
            owner = obj.order.user

        return owner == request.user

