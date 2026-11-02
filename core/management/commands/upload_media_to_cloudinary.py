import os
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Sube automáticamente las imágenes locales de media/ a Cloudinary si está configurado."

    def handle(self, *args, **options):
        cloudinary_url = getattr(settings, "CLOUDINARY_URL", None) or os.environ.get("CLOUDINARY_URL")
        if not cloudinary_url:
            self.stdout.write(self.style.WARNING("CLOUDINARY_URL no está configurado. Omitiendo subida a la nube."))
            return

        try:
            from cloudinary_storage.storage import MediaCloudinaryStorage
            storage = MediaCloudinaryStorage()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error inicializando Cloudinary storage: {e}"))
            return

        media_root = settings.MEDIA_ROOT
        if not os.path.exists(media_root):
            self.stdout.write(self.style.WARNING(f"Directorio media no encontrado: {media_root}"))
            return

        uploaded_count = 0
        skipped_count = 0

        self.stdout.write("Sincronizando archivos multimedia locales con Cloudinary...")

        for root, _, files in os.walk(media_root):
            for file in files:
                if not file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.svg')):
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, media_root).replace('\\', '/')

                try:
                    if storage.exists(rel_path):
                        skipped_count += 1
                        continue

                    with open(full_path, 'rb') as f:
                        storage.save(rel_path, f)
                        uploaded_count += 1
                        self.stdout.write(f"✓ Subido a Cloudinary: {rel_path}")
                except Exception as err:
                    self.stdout.write(self.style.WARNING(f"⚠ Error al procesar {rel_path}: {err}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Sincronización Cloudinary completada: {uploaded_count} subidos, {skipped_count} ya existentes."
            )
        )
