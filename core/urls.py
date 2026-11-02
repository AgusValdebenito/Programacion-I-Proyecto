from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CartItemViewSet,
    CartViewSet,
    HealthCheckView,
    MediaSyncView,
    NotificationViewSet,
    OrderItemViewSet,
    OrderViewSet,
    ProductViewSet,
    StoreViewSet,
)

router = DefaultRouter()
router.register(r"stores", StoreViewSet, basename="stores")
router.register(r"products", ProductViewSet, basename="products")
router.register(r"carts", CartViewSet, basename="carts")
router.register(r"cart-items", CartItemViewSet, basename="cart-items")
router.register(r"orders", OrderViewSet, basename="orders")
router.register(r"order-items", OrderItemViewSet, basename="order-items")
router.register(r"notifications", NotificationViewSet, basename="notifications")

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health_check"),
    path("media-sync/", MediaSyncView.as_view(), name="media_sync"),
    path("", include(router.urls)),
]
