from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import Store
from users.models import Usuario

User = get_user_model()


class UsuarioRegistrationTests(APITestCase):
    """Pruebas del endpoint de registro publico (TP3/TP8)."""

    def test_register_creates_client_user_successfully(self):
        payload = {
            "username": "nuevo-cliente",
            "email": "nuevo@example.com",
            "password": "Password123!",
            "name": "Juan Perez",
            "phone": "123456789",
        }
        response = self.client.post(reverse("register"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["username"], "nuevo-cliente")
        self.assertEqual(response.data["email"], "nuevo@example.com")
        self.assertEqual(response.data["role"], "cliente")
        self.assertNotIn("password", response.data)

        user = User.objects.get(email="nuevo@example.com")
        self.assertTrue(user.check_password("Password123!"))

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(
            username="existente",
            email="duplicado@example.com",
            password="testpass123",
        )
        payload = {
            "username": "otro-usuario",
            "email": "duplicado@example.com",
            "password": "Password123!",
            "name": "Pedro",
        }
        response = self.client.post(reverse("register"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_register_rejects_duplicate_username(self):
        User.objects.create_user(
            username="nombre-repetido",
            email="uno@example.com",
            password="testpass123",
        )
        payload = {
            "username": "nombre-repetido",
            "email": "dos@example.com",
            "password": "Password123!",
            "name": "Pedro",
        }
        response = self.client.post(reverse("register"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)

    def test_register_requires_password(self):
        payload = {
            "username": "sin-pass",
            "email": "sinpass@example.com",
            "name": "Sin Pass",
        }
        response = self.client.post(reverse("register"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)


class UsuarioAuthenticationJWTTests(APITestCase):
    """Pruebas de obtencion y refresco de tokens JWT (TP3/TP8)."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="login-user",
            email="login@example.com",
            password="CorrectPassword123",
            name="Usuario Login",
            role="cliente",
        )

    def test_login_with_email_returns_jwt_and_user_profile(self):
        payload = {
            "email": "login@example.com",
            "password": "CorrectPassword123",
        }
        response = self.client.post(reverse("token_obtain_pair"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "login@example.com")
        self.assertEqual(response.data["user"]["name"], "Usuario Login")
        self.assertEqual(response.data["user"]["role"], "cliente")

    def test_login_fails_with_incorrect_password(self):
        payload = {
            "email": "login@example.com",
            "password": "WrongPassword",
        }
        response = self.client.post(reverse("token_obtain_pair"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data)

    def test_login_fails_with_nonexistent_email(self):
        payload = {
            "email": "noexiste@example.com",
            "password": "AnyPassword123",
        }
        response = self.client.post(reverse("token_obtain_pair"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_fails_for_inactive_user(self):
        self.user.is_active = False
        self.user.save()

        payload = {
            "email": "login@example.com",
            "password": "CorrectPassword123",
        }
        response = self.client.post(reverse("token_obtain_pair"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_token_refresh_generates_new_access_token(self):
        refresh = RefreshToken.for_user(self.user)
        response = self.client.post(
            reverse("token_refresh"),
            {"refresh": str(refresh)},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)


class UsuarioProfileAndLogoutTests(APITestCase):
    """Pruebas de perfil y cierre de sesion con lista negra de tokens (TP3/TP8)."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="profile-user",
            email="profile@example.com",
            password="testpass123",
            name="Nombre Original",
            role="cliente",
        )

    def test_profile_requires_authentication(self):
        response = self.client.get(reverse("profile"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_returns_authenticated_user_info(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse("profile"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "profile@example.com")
        self.assertEqual(response.data["name"], "Nombre Original")

    def test_profile_patch_updates_user_data(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            reverse("profile"),
            {"name": "Nombre Actualizado", "phone": "999888777"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Nombre Actualizado")
        self.assertEqual(response.data["phone"], "999888777")
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, "Nombre Actualizado")

    def test_logout_blacklists_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            reverse("logout"),
            {"refresh": str(refresh)},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["detail"], "Sesion cerrada correctamente.")

        # Intentar refrescar con el token en lista negra debe fallar
        refresh_attempt = self.client.post(
            reverse("token_refresh"),
            {"refresh": str(refresh)},
            format="json",
        )
        self.assertEqual(refresh_attempt.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_without_refresh_token_returns_400(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(reverse("logout"), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_requires_authentication(self):
        response = self.client.post(reverse("logout"), {"refresh": "fake-token"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RoleBasedAccessControlSignalTests(APITestCase):
    """Pruebas de roles y preservacion de rol admin en senales (TP3)."""

    def test_signals_preserve_admin_role_when_store_is_deleted(self):
        admin_user = User.objects.create_superuser(
            username="admin-store-owner",
            email="admin@example.com",
            password="testpass123",
            role=Usuario.RoleChoices.ADMIN,
        )
        store = Store.objects.create(owner=admin_user, name="Tienda de Admin")
        store.delete()

        admin_user.refresh_from_db()
        self.assertEqual(admin_user.role, Usuario.RoleChoices.ADMIN)
