# Estado Actual Del Proyecto

> ⚠️ **IMPORTANTE (leer primero):** este proyecto existe en UNA sola carpeta del disco.
> Ver seccion "RESUELTO: carpeta definitiva" mas abajo para las reglas de trabajo.

## Resumen

El proyecto backend esta iniciado con Django y Django REST Framework.
La base del TP1 ya fue puesta en marcha y el TP2 quedo implementado en su estructura principal: modelos, migraciones, admin, serializers, vistas CRUD, rutas de API y Swagger.
El TP3 fue implementado completamente: autenticacion JWT, permisos por rol, registro, perfil y logout.
El TP4 esta pendiente (se hace en otro momento).
El TP5 (frontend React con Vite) esta EN PROGRESO.

## Estado actual

* Repositorio Git creado y en uso
* Proyecto Django creado en la carpeta `FoodRush/`
* Aplicaciones `core` y `users` creadas
* Dependencias principales instaladas: `Django`, `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`, `drf-spectacular`, `psycopg[binary]`
* Configuracion de `INSTALLED_APPS` realizada
* Configuracion de CORS agregada
* Base de datos definida para trabajar con PostgreSQL
* Configuracion sensible movida a variables de entorno (`DJANGO_SECRET_KEY`, `DB_*`) con carga automatica desde `.env`
* Modelo de usuario custom configurado con `AUTH_USER_MODEL = 'users.Usuario'`
* Migraciones creadas y aplicadas correctamente
* Modelos registrados en Django admin
* Serializers creados para `users` y `core`
* API CRUD inicial creada con DRF `ModelViewSet`
* Rutas `/api/` registradas para usuarios, tiendas, productos, carritos y pedidos
* Swagger disponible en `/api/docs/`
* El endpoint de carritos reutiliza el carrito existente de un usuario para respetar la relacion `OneToOne`
* Se agregaron permisos basicos para evitar modificaciones globales y restringir recursos por propietario
* La creacion de productos esta restringida a usuarios con rol `vendedor` o `admin`
* Cualquier usuario autenticado puede crear una tienda (se promueve automaticamente a `vendedor` via signals)
* README del proyecto actualizado con la estructura y endpoints actuales
* Servidor local, panel admin y superusuario ya fueron probados por el equipo
* Node.js instalado en el sistema: `v24.19.0` (npm `11.17.0`) en `C:\Program Files\nodejs`
* Chocolatey instalado (v2.7.3) y Python 3.14.6 instalados por el bootstrapper de VS Build Tools (no bloquean nada)

## Modelos implementados

Actualmente existen estos modelos:

* `users.Usuario`
* `core.Store`
* `core.Product`
* `core.Cart`
* `core.CartItem`
* `core.Order`
* `core.OrderItem`

## Modelado definido hasta ahora

Decisiones tomadas en el modelo:

* un usuario puede registrarse como `cliente`, `vendedor` o `admin`
* `cliente` es el rol por defecto
* un usuario con rol `vendedor` podra tener una sola tienda
* la tienda podra publicar productos
* un usuario tiene un solo carrito activo
* un carrito no puede repetir el mismo producto
* un pedido tiene multiples items y guarda `unit_price`

## Pendiente de implementacion

Estas partes ya estan pensadas o documentadas, pero todavia no estan completas en codigo:

* filtros y consultas mas especificas en la API
* historial de compras y flujo real de confirmacion de pedidos
* TP4 completo (matriz de pruebas, stock en productos, validaciones de compra, coleccion Postman, reporte, capturas)

## Limpieza realizada

Para dejar el repositorio mas prolijo:

* se agrego `.gitignore` en la raiz (incluye `node_modules/` y `dist/` para el frontend)
* se agrego `.env.example` como referencia para la configuracion local
* se elimino el archivo `umllmkey` del repositorio
* se eliminaron archivos `__pycache__` versionados
* se elimino `db.sqlite3` del repositorio
* se corrigio el modelo `Usuario` y se paso a custom user con `AbstractUser`
* se actualizo `requirements.txt` con el driver de PostgreSQL

## Estado del TP

* TP1: base del proyecto completada y validada por el equipo
* TP2: implementado en su parte principal
* TP3: implementado completamente y aprobado por el compañero (PR #3 y PR #5 mergeados en `main`)
* TP4: pendiente (se va a hacer en otro momento)
* TP5: en progreso (crear el `frontend/` de Vite en la carpeta definitiva)

Puntos cubiertos del TP2:

* PostgreSQL conectado
* modelos principales definidos
* migraciones creadas y aplicadas
* admin configurado
* serializers creados
* vistas CRUD iniciales funcionando a nivel de proyecto
* rutas de API registradas
* Swagger integrado

Puntos cubiertos del TP3:

* App `users` creada con modelo `Usuario` heredando de `AbstractUser`
* Campo `role` con `Choices`: `admin`, `cliente`, `vendedor`
* `AUTH_USER_MODEL` configurado en `settings.py`
* `djangorestframework-simplejwt` instalado y configurado
* `JWTAuthentication` como clase predeterminada en `REST_FRAMEWORK`
* Rutas `POST /api/token/` (login) y `POST /api/token/refresh/` (renovacion)
* Permisos personalizados por rol: `IsAdmin`, `IsVendedor`, `IsAdminOrVendedor`, `IsCliente`
* Creacion de productos restringida a ADMIN o VENDEDOR
* Lectura de productos publica
* Gestion de carrito exclusiva del cliente autenticado
* Endpoint `POST /api/register/` para registro (rol CLIENTE por defecto)
* Endpoint `GET/PATCH /api/profile/` para ver/editar perfil propio
* Endpoint `POST /api/logout/` con blacklist de tokens
* Tests actualizados y pasando

## RESUELTO: carpeta definitiva

> Antes existian DOS carpetas con el mismo proyecto en el disco, lo que causaba confusion.
> Esto ya quedo resuelto:

* **Carpeta definitiva (A):** `C:\Users\mvaldebenito\Documents\Programacion-I-Proyecto` (la de VS Code donde se programa).
  AL DIA: TP1+TP2+TP3, rama `TP5` saneada y pusheada, working tree limpio.
* **Carpeta B:** `C:\Users\mvaldebenito\Documents\GitHub\Programacion-I-Proyecto` fue **ELIMINADA del disco**
  (era una copia vieja sin TP3 y con el `frontend/` de Vite creado por error). No era parte del repo.
* El `frontend/` se va a **crear desde cero en la carpeta A**, al mismo nivel que el backend.

**REGLAS PARA EVITAR QUE VUELVA A PASAR:**
* Trabajar siempre en `C:\Users\mvaldebenito\Documents\Programacion-I-Proyecto` (la unica que queda).
* El backend NO esta en `backend/`: vive en la raiz (`FoodRush/`, `core/`, `users/`). El TP5 pide crear `frontend/` al mismo nivel sin mover el backend.

## Estado del TP5 (progreso)

* [x] Node.js instalado y verificado (`node -v` = v24.19.0, `npm -v` = 11.17.0)
* [x] `.gitignore` actualizado con `node_modules/` y `dist/`
* [x] Rama `TP5` creada sobre `main` actualizado (commit `20d8150`) y pusheada a `origin/TP5`
      (se elimino y recreo la rama remota porque estaba en un commit viejo)
* [x] Resuelta la confusion de las DOS carpetas: A (VS Code) es la definitiva y B fue eliminada
* [x] `frontend/` de Vite creado e instalado en la carpeta A (React 19, Vite 8)
* [x] `vite.config.js` con `server: { port: 3000 }`
* [x] Verificado: `npm run dev` sirve en `http://localhost:3000` (HTTP 200 OK) y `npm run lint` sin errores
* [x] `docs/diagrama.md` con el bosquejo de la Home (componentes + flujo + rutas)
* [x] Commits claros en `TP5` y push (commits `c0813da` y `39f45cc`)
* [x] PR a `main` abierto: **PR #6** (pendiente de approval del compañero por las reglas del repo)

> Nota: el commit local `091bca9` (solo marcar estos checkboxes) NO se pudo pushear a
> `origin/TP5` porque la rama es la cabeza de un PR abierto y las reglas del repo bloquean
> el push directo a ramas existentes (borrarla cerraria el PR #6). El PR #6 ya contiene todo
> el contenido del TP5 funcionando; el commit local es un detalle de documentacion.

## Observaciones

* La API ya tiene autenticacion JWT completamente funcional.
* La creacion de una tienda promueve automaticamente al usuario a `vendedor` via signals.
* Al eliminar una tienda, el usuario vuelve a `cliente` automaticamente.
* Ya no quedan credenciales de base de datos hardcodeadas en `settings.py`.
* El instalador de VS Build Tools quedo a medias/cancelado pero NO es necesario para React/Vite.
* Las reglas de GitHub del repo exigen 1 approval por PR para mergear (no hay bypass ni como admin).
* El backend NO esta en una carpeta `backend/`: vive en la raiz (`FoodRush/`, `core/`, `users/`). El TP5 pide crear `frontend/` al mismo nivel sin mover el backend.
