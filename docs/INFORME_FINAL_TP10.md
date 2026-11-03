# Trabajo Práctico N°10: Despliegue de la API en la Nube

**Materia:** Programación I  
**Profesor:** Carballo Nicolás  
**Alumno:** Agus Valdebenito  
**Proyecto:** FoodRush - Delivery Gastronómico y Comercial  
**Fecha:** 03/11/2026  

---

## Objetivo

El objetivo de este trabajo práctico fue desplegar una API RESTful desarrollada con **Django** y **Django REST Framework** en un servicio en la nube (**Render**), utilizando una base de datos relacional administrada **PostgreSQL**. Adicionalmente, se desplegó una aplicación Frontend en **React** construida con **Vite** en la plataforma **Vercel** para consumir dicha API en tiempo real con soporte SPA (*Single Page Application*), y se configuró **Cloudinary** como servicio de CDN y almacenamiento en la nube para gestionar de forma persistente los archivos multimedia (fotos de comercios y productos).

Este documento detalla los entregables de producción, las capturas de evidencia del funcionamiento y el proceso técnico paso a paso de "Cómo se subió" la aplicación.

---

## [INSERTAR AQUÍ CAPTURAS PRINCIPALES DEL FRONTEND]
*(Ver Sección "Guía de Capturas a Realizar" al final del documento)*

---

## Entregables

A continuación, se presentan los enlaces públicos del entorno de producción y los repositorios de código:

### 1. URLs Públicas de Producción
* **URL Frontend (App Web en Vercel):**  
  [https://foodrush-delivery.vercel.app/](https://foodrush-delivery.vercel.app/)
* **URL Backend (API en Render):**  
  [https://programacion-i-proyecto.onrender.com/](https://programacion-i-proyecto.onrender.com/)
* **Documentación Interactiva Swagger / OpenAPI:**  
  [https://programacion-i-proyecto.onrender.com/api/docs/](https://programacion-i-proyecto.onrender.com/api/docs/)
* **Endpoint de Health Check:**  
  [https://programacion-i-proyecto.onrender.com/api/health/](https://programacion-i-proyecto.onrender.com/api/health/)
* **Almacenamiento Multimedia (Cloudinary CDN):**  
  `https://res.cloudinary.com/ed4lhzzl/image/upload/...`

### 2. Repositorio de Código
El código fuente integral del proyecto (arquitectura monorepo con backend Django, frontend React y archivos de despliegue `render.yaml`, `Procfile`, `vercel.json` y `requirements.txt`) se encuentra en el siguiente repositorio público de GitHub:

* **Enlace al repositorio (Monorepo Backend + Frontend):**  
  [https://github.com/AgusValdebenito/Programacion-I-Proyecto](https://github.com/AgusValdebenito/Programacion-I-Proyecto)

---

## Capturas de Pantalla del Proyecto en Producción

### 1. Documentación con Swagger
La documentación interactiva de la API, generada con `drf-spectacular`, se encuentra disponible públicamente en el entorno de producción (`/api/docs/`), exponiendo los esquemas y operaciones de tiendas, productos, carritos, pedidos, notificaciones y usuarios.

> **[PEGAR AQUÍ CAPTURA 1: Swagger UI abierto en https://programacion-i-proyecto.onrender.com/api/docs/]**

---

### 2. Endpoint de Health Check (`/api/health/`)
Se implementó un endpoint público específico para verificar el estado de operatividad de la API, el cual responde con código de estado HTTP `200 OK` y el payload JSON `{"status": "ok", "service": "api"}`.

> **[PEGAR AQUÍ CAPTURA 2: Petición GET a https://programacion-i-proyecto.onrender.com/api/health/ con respuesta 200 OK en navegador o Postman]**

---

### 3. Acceso a un Endpoint Protegido (Autenticación JWT)
A continuación, se evidencia el comportamiento de los endpoints protegidos bajo SimpleJWT:

#### Acceso no autorizado (Error 401 Unauthorized):
Al intentar acceder a un endpoint restringido (como `/api/orders/` o iniciar sesión con credenciales inválidas en `/api/token/`), la API rechaza la petición con código HTTP `401 Unauthorized`.

> **[PEGAR AQUÍ CAPTURA 3: Petición a /api/orders/ sin cabecera Authorization o login erróneo mostrando HTTP 401 Unauthorized]**

#### Acceso autorizado (Respuesta 200 OK con Token JWT):
Al enviar credenciales válidas al endpoint `/api/token/` (`email` y `password`), la API valida la identidad y emite los tokens criptográficos `access` y `refresh` junto con los datos de rol y perfil del usuario.

> **[PEGAR AQUÍ CAPTURA 4: Petición POST a https://programacion-i-proyecto.onrender.com/api/token/ con credenciales válidas devolviendo HTTP 200 OK y tokens JWT]**

---

### 4. Paneles de los Proveedores Cloud

#### Panel de Render (Backend API + Base de Datos PostgreSQL):
El servicio web de Django (`foodrush-api`) y la base de datos relacional (`foodrush-db`) se encuentran en ejecución activa y estado "Live / Available" en la región Oregon de Render.

> **[PEGAR AQUÍ CAPTURA 5: Dashboard de Render mostrando el servicio foodrush-api y foodrush-db en verde ("Live")]**

#### Panel de Vercel (Frontend React + Vite):
El proyecto `foodrush` se encuentra conectado al repositorio de GitHub con despliegues automáticos (CI/CD) en estado "Ready" sobre el dominio de producción `foodrush-delivery.vercel.app`.

> **[PEGAR AQUÍ CAPTURA 6: Dashboard de Vercel mostrando el proyecto foodrush con estado "Ready" y el dominio de producción]**

#### Panel de Cloudinary (Biblioteca de Medios):
La cuenta de Cloudinary (`ed4lhzzl`) almacena de forma persistente y optimizada las 125 imágenes de los comercios y platos bajo la carpeta `media/`.

> **[PEGAR AQUÍ CAPTURA 7: Media Library de Cloudinary mostrando la carpeta media/ con las imágenes de tiendas y productos]**

---

## Documentación del Proceso de Despliegue: "Cómo se subió"

### Backend: Despliegue de Django API y PostgreSQL en Render

El proceso de despliegue del backend se llevó a cabo siguiendo estos pasos:

1. **Creación de la Base de Datos Relacional:**
   * En el dashboard de **Render**, se seleccionó **New ➔ PostgreSQL**.
   * Se asignó el nombre `foodrush-db`, en la región *Oregon (US West)* con el plan gratuito.
   * Render generó automáticamente la cadena de conexión interna y externa (`Internal Database URL` y `External Database URL`).

2. **Creación del Web Service en Render:**
   * Se conectó el repositorio de GitHub `AgusValdebenito/Programacion-I-Proyecto`.
   * **Nombre:** `foodrush-api`
   * **Entorno (Runtime):** `Python 3`
   * **Región:** *Oregon (US West)* (misma región que la BD para minimizar latencia).
   * **Rama de despliegue:** `main` con auto-deploy activado.
   * **Build Command:**  
     `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   * **Start Command:**  
     `python manage.py migrate --noinput && python manage.py populate_extended_catalog && python manage.py upload_media_to_cloudinary && gunicorn FoodRush.wsgi:application`

3. **Configuración de Variables de Entorno en Render:**
   En la pestaña **Environment** de Render, se definieron las claves necesarias:
   * `PYTHON_VERSION`: `3.12.8`
   * `DJANGO_SECRET_KEY`: Clave criptográfica segura para producción.
   * `DJANGO_DEBUG`: `False`
   * `DJANGO_ALLOWED_HOSTS`: `127.0.0.1,localhost,.onrender.com`
   * `DATABASE_URL`: Cadena de conexión inyectada automáticamente desde `foodrush-db`.
   * `CLOUDINARY_URL`: Cadena con credenciales de Cloudinary (`cloudinary://API_KEY:API_SECRET@ed4lhzzl`).

4. **Ajustes de Código en el Backend (`FoodRush/settings.py`):**
   * **WhiteNoise:** Se integró `whitenoise.middleware.WhiteNoiseMiddleware` y el almacenamiento `CompressedManifestStaticFilesStorage` para compresión y caché de archivos estáticos (CSS/JS de Swagger y Django Admin).
   * **Soporte de Base de Datos Dinámica:** Se utilizó `dj-database-url` para consumir `DATABASE_URL`.
   * **Seguridad CORS y CSRF:** Se configuraron los orígenes de confianza:
     ```python
     CORS_ALLOWED_ORIGIN_REGEXES = [
         r"^https:\/\/.*\.vercel\.app$",
         r"^https:\/\/.*\.onrender\.com$",
     ]
     CSRF_TRUSTED_ORIGINS = [
         "https://*.onrender.com",
         "https://*.vercel.app",
     ]
     ```
   * **Almacenamiento Multimedia Cloudinary:** Se integró `django-cloudinary-storage` para que los modelos almacenen las fotos directamente en el CDN de Cloudinary.

---

### Frontend: Despliegue de React en Vercel

El despliegue del frontend se realizó de la siguiente manera:

1. **Importación del Repositorio:**
   * Se inició sesión en [Vercel](https://vercel.com) con la cuenta de GitHub.
   * Se importó el proyecto `Programacion-I-Proyecto`.
2. **Ajuste de Directorio Raíz (*Root Directory*):**
   * Debido a la arquitectura monorepo, se seleccionó la subcarpeta **`frontend`** como Root Directory.
3. **Detección del Framework:**
   * Vercel detectó automáticamente el preset de **Vite**, configurando el comando de construcción `npm run build` y la carpeta de salida `dist`.
4. **Variable de Entorno del Frontend:**
   * Se agregó en Vercel la variable:
     * **Key:** `VITE_API_URL`
     * **Value:** `https://programacion-i-proyecto.onrender.com/api`
5. **Configuración de Enrutamiento SPA (`frontend/vercel.json`):**
   * Para evitar errores 404 al recargar páginas con rutas de React Router (`/tiendas`, `/carrito`, etc.), se incluyó la regla de reescritura:
     ```json
     {
       "rewrites": [
         {
           "source": "/(.*)",
           "destination": "/index.html"
         }
       ]
     }
     ```
6. **Dominio Personalizado:**
   * Se configuró el dominio público definitivo: `https://foodrush-delivery.vercel.app/`.
