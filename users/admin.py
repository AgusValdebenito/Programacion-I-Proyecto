from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    model = Usuario
    list_display = ("username", "name", "email", "role", "is_staff")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    search_fields = ("username", "name", "email")
    ordering = ("username",)
    fieldsets = UserAdmin.fieldsets + (
        (
            "Informacion adicional",
            {"fields": ("name", "phone", "role", "created_at")},
        ),
    )
    readonly_fields = ("created_at",)
