# Estado Actual Del Proyecto

> ⚠️ **IMPORTANTE (leer primero):** este proyecto existe en UNA sola carpeta del disco.
> Ver seccion "RESUELTO: carpeta definitiva" mas abajo para las reglas de trabajo.

## Resumen

El proyecto backend esta iniciado con Django y Django REST Framework.
La base del TP1 ya fue puesta en marcha y el TP2 quedo implementado en su estructura principal: modelos, migraciones, admin, serializers, vistas CRUD, rutas de API y Swagger.
El TP3 fue implementado completamente: autenticacion JWT, permisos por rol, registro, perfil y logout.
El TP4 esta pendiente (se hace en otro momento).
El TP5 (frontend React con Vite) esta COMPLETO y mergeado a `main` (PR #6).
El TP6 (maquetado de la Home con Bootstrap) esta COMPLETO y mergeado a `main` (PR #8).

## Estado actual

* Repositorio Git creado y en uso
* Proyecto Django creado en la carpeta `FoodRush/`
* Aplicaciones `core` y `users` creadas
* Dependencias principales instaladas: `Django`, `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`, `drf-spectacular`, `psycopg[binary]`, `Pillow`, `python-decouple`
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

Decisiones tomadas en el modelo y logica de negocio:

* un usuario puede registrarse como `cliente`, `vendedor` o `admin`
* `cliente` es el rol por defecto
* un usuario con rol `vendedor` podra tener una sola tienda
* la tienda podra publicar productos, gestionar su imagen y disponibilidad con `is_available`
* un usuario tiene un solo carrito activo
* un carrito solo puede contener productos de una unica tienda (regla mono-tienda)
* un carrito no puede repetir el mismo producto (incrementa la cantidad)
* un pedido pertenece a una unica tienda (`store`) y tiene multiples items con `unit_price`
* flujo de pedidos controlado por la tienda: `pending` -> `preparing` -> `delivering` -> `delivered` (o `cancelled`)
* el cliente solo puede cancelar pedidos en estado `pending`
* especificacion completa documentada en `docs/roles_y_permisos.md`

## Pendiente de implementacion

Estas partes ya estan pensadas o documentadas, pero todavia no estan completas en codigo:

* filtros y consultas mas especificas en la API
* flujo de checkout que convierta automaticamente carrito en orden y vacie el carrito
* sistema de moderacion avanzada / reportes de usuarios y tiendas (rama feature posterior)
* TP4 completo (matriz de pruebas, stock en productos, validaciones de compra, coleccion Postman, reporte, capturas)
* TP7: reemplazar los `<a href="#">` placeholders por el router de React (navegacion real)
* Sugerencia del review (pendiente): sumar un job de frontend al CI (`npm ci`, `npm run lint`, `npm run build`)

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
* TP4: completo en rama `TP4/refactor/business-logic` (matriz de pruebas en `docs/matriz_pruebas_tp4.md`, colección Postman en `postman/FoodRush_TP4.postman_collection.json`, lógica mono-tienda, disponibilidad `is_available`, imágenes, flujo de pedidos y tests automatizados)
* TP5: implementado y mergeado a `main` (PR #6)
* TP6: implementado y mergeado a `main` (PR #8)

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

Puntos cubiertos del TP5:

* Node.js instalado (`v24.19.0`) y npm (`11.17.0`)
* Proyecto `frontend/` creado con Vite + template React (React 19, Vite 8), hermano del backend en el mismo repo
* `vite.config.js` configurado con `server: { port: 3000 }`
* Verificado: `npm run dev` sirve en `http://localhost:3000` (HTTP 200) y `npm run lint` sin errores
* Bosquejo de diseno en `docs/diagrama.md` (arquitectura 2 capas, componentes, rutas y flujo de datos)
* Ruleset "Global PR protection" ajustado: ahora protege solo `main` (PR + approval para mergear) y habilita el push a ramas `TPn`
* PR a `main` abierto: **PR #6** (`TP5 -> main`)

## Estado del TP6 (progreso)

* [x] Rama `TP6/feat-HomeBootstrap` creada desde `main` actualizado y pusheada
* [x] Dependencias instaladas en `frontend/`: `bootstrap@^5.3.8`, `bootstrap-icons@^1.13.1`, `@fontsource/poppins`
* [x] Template de Vite limpiado (sin `App.css`, `index.css` ni assets de ejemplo)
* [x] Estructura creada: `src/components/` (Navbar, Logo, Hero, CategoryCard, SectionHeader, StoreLogo, Footer, BottomNav), `src/views/Home.jsx`, `src/data/homeData.js`, `src/styles/theme.css`
* [x] Home responsive: movil con header compacto + bottom nav fija; md+ con navbar clasica + footer
* [x] Paleta FoodRush (morado/amarillo) y Poppins en variables CSS del tema
* [x] Imagenes reales conectadas en `frontend/public/images/`: 5 categorias + logo (transparente) en Navbar y Footer
* [x] Placeholders reemplazables: tiendas con iniciales, hero con emojis (pendiente imagen final si se define)
* [x] Verificado: `npm run dev` sirve en `http://localhost:3000` (HTTP 200) y `npm run lint` sin errores
* [x] PR a `main` abierto y mergeado: **PR #8** (`TP6/feat-HomeBootstrap -> main`)
* [x] Review del compañero: aprobada una vez, pero el push posterior invalido el approval (regla `dismiss_stale_reviews_on_push`)
* [x] Feedback del review aplicado:
  * [x] Navegacion movil < 768px funcional: anchors reales en `BottomNav` (`#inicio`, `#categorias`) + `aria-current` en el item activo
  * [x] Trailing newlines agregados a los archivos `src` (13)
  * [x] Indentacion corregida en `CategoryCard.jsx` y `StoreLogo.jsx`
  * [x] `Home.jsx` ya no usa `slice(0,2)`/`slice(2)`: las categorias ahora usan el flag `featured` en `homeData.js`
  * [x] `footer-spacer` usa la variable CSS `--bottom-nav-buffer` (deja de estar acoplado al valor fijo 86px)
* [x] PR #8 mergeado a `main`

## RESUELTO: carpeta definitiva

> Antes existian DOS carpetas con el mismo proyecto en el disco, lo que causaba confusion.
> Esto ya quedo resuelto:

* **Carpeta definitiva (A):** `C:\Users\mvaldebenito\Documents\Programacion-I-Proyecto` (la de VS Code donde se programa).
  AL DIA: TP1+TP2+TP3+TP5+TP6 (frontend incluido), `main` con todos los TPs mergeados, working tree limpio.
* **Carpeta B:** `C:\Users\mvaldebenito\Documents\GitHub\Programacion-I-Proyecto` fue **ELIMINADA del disco**
  (era una copia vieja sin TP3 y con el `frontend/` de Vite creado por error). No era parte del repo.
* El `frontend/` ya fue **creado desde cero en la carpeta A** (React + Vite en el puerto 3000), al mismo nivel del backend.

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
* [x] Commits claros en `TP5` y push a `origin/TP5` (`c0813da`, `39f45cc`, `3e8af2e`, `694678e`)
* [x] Ruleset "Global PR protection" ajustado: protege **solo `main`** (PR + 1 approval para mergear); el push a ramas `TPn` quedo habilitado
* [x] PR a `main` mergeado: **PR #6** (`TP5 -> main`)

## Observaciones

* La API ya tiene autenticacion JWT completamente funcional.
* La creacion de una tienda promueve automaticamente al usuario a `vendedor` via signals.
* Al eliminar una tienda, el usuario vuelve a `cliente` automaticamente.
* Ya no quedan credenciales de base de datos hardcodeadas en `settings.py`.
* El instalador de VS Build Tools quedo a medias/cancelado pero NO es necesario para React/Vite.
* Las reglas de GitHub (ruleset "Global PR protection") exigen PR + 1 approval del compañero para mergear a `main`. El push directo a ramas `TPn` esta habilitado (el ruleset fue acotado a `main` en esta sesion).
* El backend NO esta en una carpeta `backend/`: vive en la raiz (`FoodRush/`, `core/`, `users/`). El TP5 pide crear `frontend/` al mismo nivel sin mover el backend.
