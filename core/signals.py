from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from users.models import Usuario

from .models import Store


@receiver(post_save, sender=Store)
def sync_store_owner_role_on_create(sender, instance, created, **kwargs):
    if created and instance.owner.role != Usuario.RoleChoices.VENDEDOR:
        sender_model = type(instance.owner)
        sender_model.objects.filter(pk=instance.owner_id).update(role=Usuario.RoleChoices.VENDEDOR)


@receiver(post_delete, sender=Store)
def sync_store_owner_role_on_delete(sender, instance, **kwargs):
    sender_model = type(instance.owner)
    sender_model.objects.filter(pk=instance.owner_id).update(role=Usuario.RoleChoices.CLIENTE)
