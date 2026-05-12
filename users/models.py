from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    class RoleChoices(models.TextChoices):
        CLIENT = "client", "Cliente"
        STORE = "store", "Tienda"

    name = models.CharField(max_length=100, verbose_name="nombre")
    email = models.EmailField(unique=True, verbose_name="correo electronico")
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name="telefono",
    )
    role = models.CharField(
        max_length=10,
        choices=RoleChoices.choices,
        default=RoleChoices.CLIENT,
        verbose_name="rol",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="fecha de creacion")

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self):
        return self.name or self.username
