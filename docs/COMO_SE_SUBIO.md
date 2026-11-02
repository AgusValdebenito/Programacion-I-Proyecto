# 🚀 Cómo se subió la aplicación FoodRush a la Nube (TP 10)

Documentación técnica del proceso de despliegue y puesta en producción de la plataforma **FoodRush** en cumplimiento de los requisitos del **Trabajo Práctico N° 10**.

---

## 🌐 URLs Públicas en Producción

* **Frontend (Vercel):** https://foodrush-nine-green.vercel.app/
* **API Backend (Render):** https://programacion-i-proyecto.onrender.com/
* **Swagger / OpenAPI:** https://programacion-i-proyecto.onrender.com/api/docs/
* **Health Check API:** https://programacion-i-proyecto.onrender.com/api/health/
* **Almacenamiento Multimedia:** Cloudinary (`res.cloudinary.com/...`)

---

## ☁️ Servicios Utilizados

* **Backend / API:** Render (PaaS con Python 3 y Gunicorn)
* **Base de Datos:** PostgreSQL en la nube (Render Managed Database)
* **Frontend:** Vercel (Edge Network / CDN con Vite SPA)
* **Almacenamiento de Media:** Cloudinary (`django-cloudinary-storage`)

---

## 📦 Método de Deploy

- [x] **Git / GitHub CI-CD**: Despliegue automático conectado a la rama del repositorio.

---

## 🛠️ Pasos Realizados para el Despliegue

### 1. Preparación de la API (Backend Django)
1. Se implementó el endpoint obligatorio de monitoreo y health check: `GET /api/health/` con respuesta `{"status": "ok", "service": "api"}` y código HTTP 200.
2. Se añadieron al archivo `requirements.txt`:
   * `gunicorn`: Servidor WSGI para entornos de producción Linux.
   * `whitenoise`: Manejo optimizado y compresión de archivos estáticos (CSS/JS de Django Admin y Swagger).
   * `dj-database-url`: Conexión automática e inyección de la variable `DATABASE_URL` de PostgreSQL.
   * `django-storages` y `django-cloudinary-storage`: Adaptador de almacenamiento en la nube para fotos de comercios y platos.
3. Se generó el archivo `Procfile` y la configuración de `railway.json` / `render.yaml` especificando:
   * Comando de inicio: `python manage.py migrate --noinput && gunicorn FoodRush.wsgi:application`
4. Se configuró `FoodRush/settings.py` con:
   * `WhiteNoiseMiddleware` inmediatamente tras `SecurityMiddleware`.
   * `STATIC_ROOT` y `STORAGES` con `CompressedManifestStaticFilesStorage`.
   * `ALLOWED_HOSTS` y `CORS_ALLOWED_ORIGIN_REGEXES` para admitir dominios de `.up.railway.app` y `.vercel.app`.
   * `CSRF_TRUSTED_ORIGINS` para solicitudes seguras HTTPS en la nube.

### 2. Pasos para Desplegar la API en Railway
1. Iniciar sesión en [Railway](https://railway.com) con GitHub.
2. Crear un nuevo proyecto ("New Project" → "Deploy from GitHub repo").
3. Seleccionar el repositorio `Programacion-I-Proyecto` y la rama de deploy.
4. Agregar un servicio de base de datos PostgreSQL ("New" → "Database" → "Add PostgreSQL").
5. En la sección "Variables" del servicio de Django, definir:
   * `DJANGO_SECRET_KEY`: Clave secreta generada para producción.
   * `DJANGO_DEBUG`: `False`
   * `DJANGO_ALLOWED_HOSTS`: `.up.railway.app,.railway.app,localhost,127.0.0.1`
   * `CLOUDINARY_URL`: `cloudinary://<api_key>:<api_secret>@<cloud_name>` (obtenida de Cloudinary).
   * *(Nota: `DATABASE_URL` es inyectada automáticamente por Railway al vincular el servicio Postgres).*
6. En "Settings" → "Networking", hacer clic en "Generate Domain" para obtener la URL pública (ej.: `https://foodrush-api-production.up.railway.app`).
7. Verificar que `/api/health/` y `/api/docs/` respondan con estado 200.

### 3. Pasos para Desplegar el Frontend en Vercel
1. Iniciar sesión en [Vercel](https://vercel.com) con GitHub.
2. Importar el repositorio `Programacion-I-Proyecto`.
3. Configuración del proyecto en Vercel:
   * **Root Directory:** `frontend/`
   * **Framework Preset:** `Vite` (detectado automáticamente).
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. Configurar variables de entorno (*Environment Variables*):
   * `VITE_API_URL`: URL pública de la API en Railway finalizada en `/api` (ej.: `https://foodrush-api-production.up.railway.app/api`).
5. Se incluyó el archivo `frontend/vercel.json` con reescrituras (*rewrites*) a `/index.html` para garantizar que la navegación interna con React Router no arroje error 404 al refrescar páginas.
6. Hacer clic en "Deploy" y verificar la URL generada (ej.: `https://foodrush.vercel.app`).

### 4. Pasos para Cloudinary (Almacenamiento Multimedia)
1. Crear cuenta gratuita en [Cloudinary](https://cloudinary.com).
2. Desde el Dashboard principal, copiar la variable `CLOUDINARY_URL` (formato `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`).
3. Pegar la variable `CLOUDINARY_URL` en las variables de entorno de Railway.
4. Probar la creación/edición de un producto con imagen desde el panel de tienda y verificar que la URL de la imagen apunte a `res.cloudinary.com`.

---

## 🔑 Variables de Entorno Utilizadas

| Variable | Servicio | Descripción | Ejemplo / Valor |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Railway (Backend) | Cadena de conexión provista por PostgreSQL en la nube | `postgresql://postgres:...@...railway.app:5432/railway` |
| `DJANGO_SECRET_KEY` | Railway (Backend) | Clave criptográfica para firmas y sesiones | Cadena aleatoria segura de 50 caracteres |
| `DJANGO_DEBUG` | Railway (Backend) | Modo depuración desactivado en producción | `False` |
| `DJANGO_ALLOWED_HOSTS` | Railway (Backend) | Dominios autorizados para responder peticiones | `.up.railway.app,localhost,127.0.0.1` |
| `CLOUDINARY_URL` | Railway (Backend) | Credencial de autenticación con la API de Cloudinary | `cloudinary://key:secret@cloudname` |
| `VITE_API_URL` | Vercel (Frontend) | URL base del backend para llamadas Axios/Fetch | `https://[RAILWAY_URL]/api` |

---

## 📸 Capturas de Pantalla Requeridas para la Entrega

*(Las capturas se adjuntarán una vez completado el despliegue con las URLs definitivas)*

1. [ ] **Swagger / Redoc:** Vista de `/api/docs/` abierta en el dominio público de Railway.
2. [ ] **Health Check:** Respuesta JSON exitosa de `GET /api/health/`.
3. [ ] **Endpoint Protegido:** Solicitud con y sin token JWT (códigos 401 y 200).
4. [ ] **Frontend en Producción:** Catálogo y navegación cargando datos reales desde la API cloud.
5. [ ] **Cloudinary Media:** Imagen subida desde el panel visible en la librería de medios de Cloudinary.
6. [ ] **Paneles de Control:** Railway y Vercel mostrando el servicio en estado "Active / Running".

---

## ⚠️ Problemas Encontrados y Soluciones

* **Rutas directas en Frontend arrojaban 404 en Vercel:**  
  * *Causa:* Al ser una SPA (Single Page Application) gobernada por React Router, recargar rutas como `/stores` o `/perfil` busca un archivo físico que no existe en el servidor web.  
  * *Solución:* Se agregó `vercel.json` con la regla de reescritura `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}`.
* **Archivos estáticos de Django Admin sin estilos en producción:**  
  * *Causa:* Por defecto Django no sirve archivos estáticos cuando `DEBUG=False`.  
  * *Solución:* Se integró la librería `whitenoise` en `MIDDLEWARE` y se configuró `STATIC_ROOT` para empaquetarlos durante el `collectstatic`.
* **Persistencia de imágenes en servidores efímeros:**  
  * *Causa:* PaaS como Railway o Render borran el sistema de archivos local en cada reinicio o nuevo despliegue.  
  * *Solución:* Se desacopló la multimedia local mediante `django-cloudinary-storage`, enviando las imágenes directamente al CDN de Cloudinary.
