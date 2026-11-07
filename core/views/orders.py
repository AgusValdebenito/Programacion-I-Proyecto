from django.db import models, transaction
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from users.models import Usuario

from ..models import Order, OrderItem
from ..permissions import IsOrderParticipantOrAdmin, is_admin_user
from ..serializers import OrderItemSerializer, OrderRatingSerializer, OrderSerializer
from ..services import OrderService


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("id")
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipantOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if is_admin_user(user):
            queryset = super().get_queryset()
        else:
            queryset = self.queryset.filter(models.Q(user=user) | models.Q(store__owner=user)).distinct()

        store_id = self.request.query_params.get("store")
        if store_id:
            queryset = queryset.filter(store_id=store_id)

        return queryset.select_related("store", "cancelled_product", "rating").prefetch_related("items__product")

    def perform_create(self, serializer):
        user = self.request.user
        if not (is_admin_user(user) or getattr(user, "role", None) == Usuario.RoleChoices.CLIENTE):
            raise PermissionDenied(
                "Los vendedores no pueden realizar pedidos. Esta acción está reservada para clientes y administradores."
            )
        raise ValidationError(
            {"detail": "La creación directa de pedidos no está permitida. Use el checkout del carrito (/api/carts/checkout/)."}
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        if "total" in self.request.data:
            raise ValidationError({"total": "No está permitido modificar el total de un pedido existente."})
        if "store" in self.request.data:
            raise ValidationError({"store": "No está permitido modificar la tienda de un pedido existente."})

        new_status = self.request.data.get("status", instance.status)

        if new_status == instance.status:
            return

        cancellation_reason = self.request.data.get("cancellation_reason")
        cancelled_product = self.request.data.get("cancelled_product") or self.request.data.get("out_of_stock_product")

        order = OrderService.transition_status(
            order=instance,
            new_status=new_status,
            user=self.request.user,
            cancellation_reason=cancellation_reason,
            cancelled_product=cancelled_product,
        )
        serializer.instance = order

    @action(detail=True, methods=["post"], url_path="rate", permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        order = self.get_object()

        if order.user != request.user and not is_admin_user(request.user):
            raise PermissionDenied("Solo el cliente que realizó el pedido puede calificarlo.")

        if order.status != Order.StatusChoices.DELIVERED:
            raise ValidationError({"detail": "Solo se pueden calificar pedidos que hayan sido entregados."})

        if hasattr(order, "rating") and order.rating is not None:
            raise ValidationError({"detail": "Este pedido ya ha sido calificado previamente."})

        serializer = OrderRatingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rating_obj = serializer.save(order=order)

        return Response(OrderRatingSerializer(rating_obj).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        raise ValidationError({"detail": "Los pedidos no pueden ser eliminados. Use la cancelación de pedidos."})


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all().order_by("id")
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipantOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if is_admin_user(user):
            return super().get_queryset()

        return self.queryset.filter(
            models.Q(order__user=user) | models.Q(order__store__owner=user)
        ).distinct()

    def perform_create(self, serializer):
        user = self.request.user
        if not (is_admin_user(user) or getattr(user, "role", None) == Usuario.RoleChoices.CLIENTE):
            raise PermissionDenied(
                "Los vendedores no pueden realizar pedidos. Esta acción está reservada para clientes y administradores."
            )

        order = serializer.validated_data["order"]
        if order.status != Order.StatusChoices.PENDING:
            raise ValidationError({"detail": "Solo se pueden agregar ítems a pedidos en estado 'Pendiente'."})

        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        with transaction.atomic():
            unit_price = OrderService.validate_and_prepare_item(
                order=order,
                product=product,
                quantity=quantity,
                user=self.request.user,
            )

            serializer.save(unit_price=unit_price)

            # Recalcular el total del pedido
            order.total += unit_price * quantity
            order.save(update_fields=["total"])

    def update(self, request, *args, **kwargs):
        raise ValidationError({"detail": "Los ítems de pedido no pueden ser modificados individualmente."})

    def destroy(self, request, *args, **kwargs):
        raise ValidationError({"detail": "Los ítems de pedido no pueden ser eliminados individualmente."})
