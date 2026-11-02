# 🚀 Cómo se subió la aplicación FoodRush a la Nube (TP 10)

Documentación técnica del proceso de despliegue y puesta en producción de la plataforma **FoodRush** en cumplimiento estricto de los requisitos del **Trabajo Práctico N° 10**.

---

## 🌐 URLs Públicas en Producción

* **Frontend (Vercel):** [https://foodrush-delivery.vercel.app/](https://foodrush-delivery.vercel.app/)
* **API Backend (Render):** [https://programacion-i-proyecto.onrender.com/](https://programacion-i-proyecto.onrender.com/)
* **Swagger / OpenAPI (API Docs):** [https://programacion-i-proyecto.onrender.com/api/docs/](https://programacion-i-proyecto.onrender.com/api/docs/)
* **Health Check API:** [https://programacion-i-proyecto.onrender.com/api/health/](https://programacion-i-proyecto.onrender.com/api/health/)
* **Almacenamiento Multimedia (Cloudinary):** `https://res.cloudinary.com/ed4lhzzl/image/upload/...`

---

## ☁️ Servicios Utilizados

| Componente | Proveedor Cloud | Tecnología / Plan | Rol en la Arquitectura |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | Edge Network / Vite SPA (Hobby) | Servir la aplicación React compilada con HTTPS global y soporte SPA |
| **Backend / API** | **Render** | Web Service (Python 3.12 / Gunicorn) | Servidor WSGI ejecutando la API REST Django y documentación Swagger |
| **Base de Datos** | **Render** | PostgreSQL Administrado (Free) | Persistencia relacional de usuarios, tiendas, productos, carritos y pedidos |
| **Archivos Multimedia** | **Cloudinary** | CDN Cloudinary (`django-cloudinary-storage`) | Almacenamiento y optimización de imágenes de locales y platos |

---

## 📦 Método de Deploy

- [x] **Git / GitHub CI-CD**: Despliegue automático conectado a la rama `main` del repositorio.

---

## 🛠️ Pasos Realizados para el Despliegue

### 1. Preparación de la API (Backend Django)
1. Se implementó el endpoint obligatorio de monitoreo y health check: `GET /api/health/` con respuesta `{"status": "ok", "service": "api"}` y código HTTP 200 (testeado mediante `core.tests.HealthCheckAPITests`).
2. Se actualizaron las dependencias en `requirements.txt`:
   * `gunicorn`: Servidor WSGI para entornos de producción Linux.
   * `whitenoise`: Manejo optimizado y compresión de archivos estáticos (CSS/JS de Django Admin y Swagger).
   * `dj-database-url`: Inyección e interpretación de la variable `DATABASE_URL` de PostgreSQL.
   * `django-storages` y `django-cloudinary-storage`: Adaptador de almacenamiento en la nube para fotos de comercios y platos.
3. Se generaron los archivos de orquestación `Procfile` y `render.yaml` especificando:
   * **Start command:** `python manage.py migrate --noinput && python manage.py populate_extended_catalog && python manage.py upload_media_to_cloudinary && gunicorn FoodRush.wsgi:application`
4. Se configuró `FoodRush/settings.py` con:
   * `WhiteNoiseMiddleware` inmediatamente tras `SecurityMiddleware`.
   * `STATIC_ROOT` y `STORAGES` con `CompressedManifestStaticFilesStorage`.
   * `ALLOWED_HOSTS` y `CORS_ALLOWED_ORIGIN_REGEXES` para admitir dominios de `.onrender.com` y `.vercel.app`.
   * `CSRF_TRUSTED_ORIGINS` para solicitudes seguras HTTPS en la nube.
   * Respaldo de rutas estáticas en `FoodRush/urls.py` con `django.views.static.serve` ante cualquier retraso de red.

### 2. Pasos para Desplegar en Render (Backend y PostgreSQL)
1. Se inició sesión en [Render](https://dashboard.render.com) mediante GitHub.
2. **Base de Datos:** Se creó una instancia PostgreSQL (`foodrush-db`) en la región *Oregon (US West)* con plan gratuito.
3. **Web Service:** Se creó el servicio web `foodrush-api` conectado al repositorio `Programacion-I-Proyecto`:
   * **Runtime:** `Python 3`.
   * **Region:** *Oregon (US West)* (misma región que la base de datos para latencia cero).
   * **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   * **Start Command:** `python manage.py migrate --noinput && python manage.py populate_extended_catalog && python manage.py upload_media_to_cloudinary && gunicorn FoodRush.wsgi:application`
4. **Variables de Entorno configuradas en Render:**
   * `PYTHON_VERSION`: `3.12.8`
   * `DJANGO_SECRET_KEY`: Clave criptográfica segura para producción.
   * `DJANGO_DEBUG`: `False`
   * `DATABASE_URL`: Cadena de conexión inyectada desde la base de datos PostgreSQL.
   * `CLOUDINARY_URL`: Cadena de conexión obtenida de Cloudinary (`cloudinary://API_KEY:API_SECRET@ed4lhzzl`).
5. Se verificó que `/api/health/` y `/api/docs/` respondan con estado `200 OK`.

### 3. Pasos para Desplegar el Frontend en Vercel
1. Se inició sesión en [Vercel](https://vercel.com) mediante GitHub.
2. Se importó el repositorio `Programacion-I-Proyecto` con el nombre de proyecto `foodrush`.
3. Configuración del proyecto en Vercel:
   * **Root Directory:** `frontend/`
   * **Framework Preset:** `Vite` (detectado automáticamente).
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. **Variables de Entorno configuradas en Vercel:**
   * `VITE_API_URL`: `https://programacion-i-proyecto.onrender.com/api`
5. Se incluyó el archivo `frontend/vercel.json` con reescrituras (*rewrites*) a `/index.html` para evitar errores 404 al recargar rutas en la SPA.
6. Se personalizó el dominio de producción a: `https://foodrush-delivery.vercel.app/`.

### 4. Pasos para Cloudinary (Almacenamiento Multimedia)
1. Se creó la cuenta gratuita en [Cloudinary](https://cloudinary.com) (Cloud Name: `ed4lhzzl`).
2. Se obtuvo la variable `CLOUDINARY_URL` con sus respectivas credenciales API Key y API Secret.
3. Se vinculó la variable en el backend de Render.
4. Se desarrolló el comando automático `python manage.py upload_media_to_cloudinary` para migrar todo el catálogo inicial de imágenes a la nube de Cloudinary en el arranque.

---

## 🔑 Variables de Entorno Utilizadas

| Variable | Servicio | Descripción | Valor Configurado |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Render (Backend) | Cadena de conexión provista por PostgreSQL en la nube | `postgresql://postgres:...@dpg-...-a.oregon-postgres.render.com/foodrush_db` |
| `DJANGO_SECRET_KEY` | Render (Backend) | Clave criptográfica para firmas y sesiones | Generada para producción |
| `DJANGO_DEBUG` | Render (Backend) | Modo depuración desactivado en producción | `False` |
| `DJANGO_ALLOWED_HOSTS` | Render (Backend) | Dominios autorizados para responder peticiones | `127.0.0.1,localhost,.onrender.com` |
| `CLOUDINARY_URL` | Render (Backend) | Credencial de autenticación con la API de Cloudinary | `cloudinary://API_KEY:API_SECRET@ed4lhzzl` |
| `VITE_API_URL` | Vercel (Frontend) | URL base del backend para llamadas Axios/Fetch | `https://programacion-i-proyecto.onrender.com/api` |

---

## 📸 Checklist de Capturas Requeridas para la Entrega

1. [x] **Swagger / Redoc:** Vista de `/api/docs/` abierta en el dominio público de Render.
2. [x] **Health Check:** Respuesta JSON exitosa `{"status": "ok", "service": "api"}` de `GET /api/health/`.
3. [x] **Endpoint Protegido:** Solicitud con y sin token JWT (códigos 401 y 200).
4. [x] **Frontend en Producción:** Catálogo y navegación en `https://foodrush-delivery.vercel.app/`.
5. [x] **Cloudinary Media:** Imágenes de comercios y platos visibles en la biblioteca de Cloudinary (`ed4lhzzl`).
6. [x] **Paneles de Control:** Render y Vercel mostrando los servicios en estado "Live / Running".
