import os
import requests
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Sube automáticamente las imágenes locales de media/ a Cloudinary si está configurado."

    def handle(self, *args, **options):
        cloudinary_url = getattr(settings, "CLOUDINARY_URL", None) or os.environ.get("CLOUDINARY_URL")
        if not cloudinary_url:
            self.stdout.write(self.style.WARNING("CLOUDINARY_URL no está configurado. Omitiendo subida a la nube."))
            return

        os.environ["CLOUDINARY_URL"] = cloudinary_url

        try:
            import cloudinary
            import cloudinary.uploader
            cloudinary.reset_config()
            cloud_name = cloudinary.config().cloud_name
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error configurando cloudinary: {e}"))
            return

        media_root = str(settings.MEDIA_ROOT)
        if not os.path.exists(media_root):
            self.stdout.write(self.style.WARNING(f"Directorio media no encontrado: {media_root}"))
            return

        uploaded_count = 0
        skipped_count = 0
        error_count = 0

        self.stdout.write("Sincronizando archivos multimedia locales con Cloudinary...")

        for root, _, files in os.walk(media_root):
            for file in files:
                if not file.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".svg")):
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, media_root).replace("\\", "/")

                # Cloudinary public_id: media/<ruta_sin_extension>
                base_name, ext = os.path.splitext(rel_path)
                public_id = f"media/{base_name}"

                # Comprobación HEAD rápida: si ya existe en Cloudinary, se omite para ahorrar ancho de banda
                if cloud_name:
                    check_url = f"https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}{ext}"
                    try:
                        res = requests.head(check_url, timeout=3)
                        if res.status_code == 200:
                            skipped_count += 1
                            continue
                    except Exception:
                        pass

                try:
                    with open(full_path, "rb") as f:
                        cloudinary.uploader.upload(
                            f,
                            public_id=public_id,
                            overwrite=True,
                            resource_type="image",
                            tags=["media"],
                        )
                    uploaded_count += 1
                    self.stdout.write(f"✓ Subido a Cloudinary: {public_id}")
                except Exception as err:
                    error_count += 1
                    self.stdout.write(self.style.WARNING(f"⚠ Error al procesar {rel_path}: {err}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Sincronización Cloudinary completada: {uploaded_count} subidos, {skipped_count} ya existentes, {error_count} errores."
            )
        )
