from django.conf import settings
from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class ProjectConfigurationSmokeTests(SimpleTestCase):
    """Pruebas base de configuracion inicial del backend (TP1)."""

    def test_installed_apps_contains_required_dependencies(self):
        required_apps = [
            "rest_framework",
            "corsheaders",
            "drf_spectacular",
            "users",
            "core",
        ]
        for app in required_apps:
            self.assertIn(app, settings.INSTALLED_APPS)

    def test_custom_user_model_is_configured(self):
        self.assertEqual(settings.AUTH_USER_MODEL, "users.Usuario")

    def test_cors_allowed_origins_is_configured(self):
        self.assertTrue(hasattr(settings, "CORS_ALLOWED_ORIGINS"))
        self.assertIn("http://localhost:3000", settings.CORS_ALLOWED_ORIGINS)


class DocumentationEndpointsTests(APITestCase):
    """Verifica la disponibilidad de OpenAPI y Swagger configurados en TP1/TP2."""

    def test_openapi_schema_endpoint_responds_ok(self):
        response = self.client.get(reverse("schema"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_swagger_ui_endpoint_responds_ok(self):
        response = self.client.get(reverse("swagger-ui"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
