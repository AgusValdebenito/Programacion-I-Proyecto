import threading
from io import StringIO

from django.core.management import call_command
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    """
    Endpoint público de verificación de salud de la API (TP10).
    Permite a Railway, Render, Vercel o monitores externos comprobar que el servicio está online.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Health Check de la API",
        description="Retorna el estado de operatividad de la API para servicios de cloud y orquestadores.",
        responses={200: dict},
    )
    def get(self, request, *args, **kwargs):
        return Response({"status": "ok", "service": "api"}, status=status.HTTP_200_OK)


class MediaSyncView(APIView):
    """
    Endpoint de mantenimiento para sincronizar archivos locales con Cloudinary (TP10).
    Permite disparar la sincronización en Render sin necesidad de consola interactiva.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Sincronizar catálogo multimedia con Cloudinary",
        description="Ejecuta la carga de imágenes locales hacia Cloudinary.",
        responses={200: dict},
    )
    def get(self, request, *args, **kwargs):
        force = request.query_params.get("force", "false").lower() in ("true", "1")
        populate = request.query_params.get("populate", "false").lower() in ("true", "1")
        target_path = request.query_params.get("path", None)
        run_in_background = request.query_params.get("bg", "false").lower() in ("true", "1") or (not target_path and force)

        def run_sync():
            try:
                cmd_kwargs = {"force": force}
                if target_path:
                    cmd_kwargs["path"] = target_path
                call_command("upload_media_to_cloudinary", **cmd_kwargs)
                if populate:
                    call_command("populate_extended_catalog")
            except Exception as err:
                print(f"[MediaSync] Error en segundo plano: {err}")

        if run_in_background:
            t = threading.Thread(target=run_sync, daemon=True)
            t.start()
            return Response(
                {
                    "status": "started",
                    "message": "Sincronización Cloudinary iniciada en segundo plano para evitar timeouts.",
                    "force": force,
                    "path": target_path,
                    "populate": populate,
                },
                status=status.HTTP_200_OK,
            )

        out = StringIO()
        try:
            cmd_kwargs = {"force": force, "stdout": out}
            if target_path:
                cmd_kwargs["path"] = target_path
            call_command("upload_media_to_cloudinary", **cmd_kwargs)
            if populate:
                call_command("populate_extended_catalog", stdout=out)
            return Response({"status": "ok", "output": out.getvalue()}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"status": "error", "detail": str(e), "output": out.getvalue()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
