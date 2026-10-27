# Estado Actual Del Proyecto

> ⚠️ **IMPORTANTE (leer primero):** este proyecto existe en UNA sola carpeta del disco.
> Ver seccion "RESUELTO: carpeta definitiva" mas abajo para las reglas de trabajo.

## Resumen

El proyecto backend esta iniciado con Django y Django REST Framework.
La base del TP1 ya fue puesta en marcha y el TP2 quedo implementado en su estructura principal: modelos, migraciones, admin, serializers, vistas CRUD, rutas de API y Swagger.
El TP3 fue implementado completamente: autenticacion JWT, permisos por rol, registro, perfil y logout.
El TP4 esta completo en rama `TP4/refactor/business-logic`.
El TP5 (frontend React con Vite) esta COMPLETO y mergeado a `main` (PR #6).
El TP6 (maquetado de la Home con Bootstrap) esta COMPLETO y mergeado a `main` (PR #8).
El TP8 (Conexión Frontend con Backend) esta COMPLETO en la rama `TP8/feat-connect-frontend-backend`.
El TP9 (Vistas Completas y Funcionalidad Full-Stack) se encuentra en desarrollo activo en la rama `TP9` (PR #37), con el **Milestone 1** (Catálogo Real y Carrito), el **Milestone 2** (Checkout Transaccional y Gestión de Pedidos) y el **Milestone 3** (Panel de Vendedor, Menú y Cocina) 100% completados, probados bajo estricto TDD y formalmente cerrados en GitHub.

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
* Manejo de multimedia y estáticos configurado en Django (`MEDIA_URL = '/media/'`, `MEDIA_ROOT = BASE_DIR / 'media'`)
* Catálogo visual completo: imágenes reales para las 6 tiendas y 29 productos descargadas y vinculadas
* Helper `imageUrl.js` en frontend con resolución dinámica de URLs de backend y fallbacks ante error (`onError`)
* 198 tests unitarios e integrados pasando en frontend con Vitest y React Testing Library (0 errores ESLint)
* 97 tests automatizados pasando en backend con Django REST Framework y PostgreSQL/SQLite de testing
* Milestones 1, 2 y 3 formalmente completados y cerrados en GitHub (#13 al #21, #38)

## Modelos implementados

Actualmente existen estos modelos:

* `users.Usuario`
* `core.Store`
* `core.Product`
* `core.Cart`
* `core.CartItem`
* `core.Order`
* `core.OrderItem`
* `core.FavoriteStore`
* `core.OrderRating`

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

## Pendiente de implementación (Backlog y Roadmap)

Todas las tareas y funcionalidades se encuentran organizadas y registradas como **GitHub Issues (#13 al #26, #38 al #45)** agrupadas en Milestones temáticos:

* **M1: Catálogo Real y Carrito en Frontend:** [COMPLETADO Y CERRADO] Issues [#13](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/13), [#14](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/14) y [#15](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/15).
* **M2: Checkout Transaccional y Gestión de Pedidos:** [COMPLETADO Y CERRADO] Issues [#16](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/16), [#17](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/17), [#18](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/18) y [#38](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/38).
* **M3: Panel de Vendedor y Gestión de Tienda:** [COMPLETADO Y CERRADO] Issues [#19](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/19), [#20](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/20) y [#21](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/21).
* **M4: Reglas Gastronómicas y Stock Híbrido:** [COMPLETADO Y CERRADO] Issues [#22](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/22) y [#23](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/23) (especificado en `docs/propuesta_disponibilidad_gastronomica.md`).
* **M5: Calidad, Moderación y DevOps:** [COMPLETADO Y CERRADO] Issues [#24](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/24), [#25](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/25) y [#26](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/26).
* **M6: Descubrimiento, Publicidad y Fidelización:** En desarrollo en `feature/roadmap-tp10`. Issue [#42](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/42) (Tiendas Favoritas) [COMPLETADO Y TESTEADO]; Issues [#39](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/39) (Vista Explorar) y [#41](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/41) (Carrusel de Destacados) pospuestos según decisión de roadmap.
* **M7: Tracking en Tiempo Real, Alertas y Calificaciones:** En desarrollo en `feature/roadmap-tp10`. Issues [#40](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/40) (Notificaciones en Navbar) y [#44](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/44) (Calificaciones por Estrellas y Motivos) [COMPLETADOS Y TESTEADOS]; Issue [#43](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/43) (Seguimiento de Pedido con Mapa, Barra y ETA) pendiente según decisión de roadmap.
* **M8: Despliegue en Producción, Pruebas UAT y Entrega Final:** Issue [#45](https://github.com/AgusValdebenito/Programacion-I-Proyecto/issues/45) (Pruebas de Aceptación UAT y Bug Bash en la nube).

Asimismo, los trabajos prácticos y refactorizaciones ya entregadas fueron formalizados como **Issues Históricas Cerradas ([#27 al #36](https://github.com/AgusValdebenito/Programacion-I-Proyecto/milestone/6?closed=1))** vinculadas a sus respectivos PRs (#1 al #12).

> 📌 Para consultar el desglose técnico detallado con checklists, ver [`docs/plan_issues_github.md`](docs/plan_issues_github.md).


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

* TP1: base del proyecto completada y validada por el equipo (saneado en rama refactor con `test_setup.py` y decouple)
* TP2: implementado en su parte principal (serializers explícitos y `test_models.py` en rama refactor)
* TP3: implementado completamente y aprobado por el compañero (PR #3 y PR #5 mergeados en `main`, 16 tests automatizados en `users/tests.py`, signals protegidas contra degradación de admin)
* TP4: completo y mergeado a `main` (PR #10) (Service Layer `CartService` y `OrderService`, búsqueda en productos, descuento de stock y tests de borde)
* TP5: implementado y mergeado a `main` (PR #6) (Infraestructura Vitest + Testing Library agregada al frontend)
* TP6: implementado y mergeado a `main` (PR #8) (Suites de tests unitarios de componentes UI: CategoryCard, StoreLogo, Hero, BottomNav)
* TP7: autenticación y rutas con React Router y mock data mergeado a `main` (PR #9) (Módulo puro `token.js` con tests unitarios y ProtectedRoute testeado)
* TP8: implementado completamente y desacoplado (capa `authService.js`, `Home.jsx` refactorizado, 38 tests frontend y 49 tests backend pasando al 100%)
* TP9: implementado y activo en rama `TP9` (PR #37). Milestones 1, 2, 3, 4 y 5 completados al 100% bajo TDD estricto. Vistas completas de catálogo, detalle de tienda, carrito mono-tienda, checkout transaccional, historial de pedidos, perfil con direcciones guardadas, panel de administración del vendedor (onboarding de tienda, gestión de catálogo y monitor de cocina/despacho), stock híbrido gastronómico, búsqueda/ordenamiento reactivo con debounce y panel de moderación para administradores.
* TP10: Preparación de infraestructura con pipeline de CI/CD para frontend (`frontend-ci.yml`) y backend (`repository-checks.yml`) en GitHub Actions.

### Métricas de Calidad y Tests del Proyecto
* **Backend:** 79 tests automatizados pasando en verde (`python manage.py test`). Thin controllers (Service Layer desacoplado con `CartService` y `OrderService`), permisos centralizados, señales blindadas, `SearchFilter`, `OrderingFilter` y moderación admin.
* **Frontend:** 166 tests unitarios e integrados pasando en verde (`npm test` con Vitest en 27 suites). 0 errores de ESLint (`npm run lint`), build de producción optimizado (`npm run build`). Contextos desacoplados (`AuthContext`, `CartContext`, `AddressContext`), utilidades puras y panel de moderación `/admin/moderacion`.
* **Documentación:** Propuesta arquitectónica de disponibilidad gastronómica documentada en `docs/propuesta_disponibilidad_gastronomica.md` y consignas oficiales en `tps/`.


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

## Puntos cubiertos del TP8 (Conexión Frontend con Backend)

* [x] Backend: Serializador `EmailTokenObtainPairSerializer` para login con `email` y `password`, devolviendo tokens `access`, `refresh` y payload con datos de usuario (`id`, `email`, `name`, `role`).
* [x] Backend: Soporte de registro público asignando rol `cliente` por defecto y creación de usuario completa.
* [x] Frontend: Conexión con `fetch` nativo sin librerías externas adicionales.
* [x] Frontend: `AuthContext.jsx` conectado a endpoints reales con manejo de `localStorage` (`access_token`, `refresh_token`, `user`).
* [x] Frontend: Decodificación y expiración de JWT (`exp`), silent refresh automático mediante `POST /api/token/refresh/`.
* [x] Frontend: Login (`Login.jsx`) con estados de carga, captura de errores de la API y redirección a la ruta previa o `/`.
* [x] Frontend: Registro (`Register.jsx`) con validación, feedback de error/éxito y redirección a `/login`.
* [x] Frontend: Cierre de sesión (`Navbar.jsx` / `AuthContext.jsx`) con blacklist en `POST /api/logout/` y redirección a `/login`.
* [x] Frontend: Saludo personalizado en `Hero.jsx` consumiendo `GET /api/profile/` con header `Authorization: Bearer <token>`.
* [x] Frontend: `ProtectedRoute.jsx` verificando vigencia del token y autenticación antes de dar acceso.
* [x] Verificado: `npm run lint` 0 errores, `npm run build` exitoso y tests de Django 18/18 pasando.

## Puntos cubiertos del TP9 (Vistas Completas y Funcionalidad Full-Stack)

### 🚀 Milestone 1: Catálogo Real y Carrito en Frontend (Cerrado en GitHub)
* [x] **Issue #13 (Visualización de productos y tiendas reales):**
  * `StoreDetail.jsx` conectado a `GET /api/stores/:id/` y `GET /api/products/?store=:id`.
  * Componente `ProductCard.jsx` modularizado con selector de cantidad, badge de disponibilidad y modal de detalle accesible.
  * Consumo desacoplado mediante servicios puros `storeService.js` y `productService.js`.
* [x] **Issue #14 (Integración del carrito frontend con API):**
  * `CartContext.jsx` para gestión reactiva del estado global del carrito.
  * Capa `cartService.js` consumiendo endpoints reales `/api/carts/` y `/api/cart-items/`.
  * Cálculo dinámico de totales, sincronización automática tras cada mutación y preservación de estado.
* [x] **Issue #15 (Vista de Carrito de Compras):**
  * `Cart.jsx` con renderizado de items, controles de incremento y decremento de cantidad (+ / -).
  * Control de límites de stock con deshabilitación en 10 unidades (`btn-group flex-nowrap` sin salto de línea en desktop/móvil).
  * Validación y manejo estricto de la regla mono-tienda (alerta si se intenta agregar de otro comercio).
  * Subtotal reactivo en tiempo real, empty state con llamada a la acción y botón de avance hacia `/checkout`.

### 📦 Milestone 2: Checkout Transaccional y Gestión de Pedidos (Cerrado en GitHub)
* [x] **Issue #16 (Vista y Flujo Transaccional de Checkout):**
  * `Checkout.jsx` con formulario de validación estricta (dirección, notas, teléfono).
  * Autocompletado de dirección y teléfono según la dirección activa del perfil, permitiendo edición libre antes de confirmar.
  * Selección de método de pago simulado (Efectivo, Tarjeta, Transferencia) con resumen de costos.
  * Llamada atómica a `OrderService.create_order_from_cart()`, vaciado del carrito y redirección inmediata a `/pedidos`.
* [x] **Issue #17 (Detalle y Seguimiento de Pedido):**
  * Modal y vista de seguimiento con ID de orden, estado actual con badges temáticos y desglose de items y precio unitario.
* [x] **Issue #18 (Historial de Pedidos y Perfil de Usuario):**
  * `Profile.jsx` con sincronización bidireccional entre la URL (`/perfil` y `/pedidos`) y las pestañas activas, resolviendo bugs de navegación.
  * `AddressContext.jsx` con soporte completo de direcciones guardadas (creación, selección como activa, eliminación y persistencia local).
  * Selector interactivo de dirección en el header/navbar que actualiza el destino en toda la aplicación.
  * Historial de pedidos consumiendo `GET /api/orders/` ordenado cronológicamente con formato de fecha legible.
* [x] **Issue #38 (Catálogo General de Tiendas y Navegación por Categorías):**
  * `Stores.jsx` en rutas `/tiendas` y `/explorar`.
  * Filtro interactivo por categorías gastronómicas (Restaurantes, Super y Kioscos, Café y Deli, Helados, Farmacias).
  * Buscador en tiempo real de comercios por nombre y descripción.
  * Enrutamiento funcional de todos los botones y cards de categorías desde la Home (`homeData.js`).

### 🏪 Milestone 3: Panel de Vendedor y Gestión de Tienda (Cerrado en GitHub)
* [x] **Issue #19 (Panel de Vendedor y Gestión de Tienda):**
  * Vista `PanelTienda.jsx` protegida en `/panel-tienda` con control de acceso por roles (`vendedor`, `admin`, `cliente`).
  * Flujo de onboarding intuitivo para clientes sin comercio registrado con formulario de creación rápida de tienda (`POST /api/stores/`).
  * Promoción automática de rol y sincronización reactiva inmediata mediante `updateUser()` en `AuthContext`.
  * Modal `EditarTiendaModal.jsx` para actualización de nombre, descripción, dirección y logo de la tienda (`PATCH /api/stores/:id/`).
  * Métricas y KPIs de rendimiento en tiempo real (total de productos, catálogo activo, pedidos pendientes y facturación acumulada).
* [x] **Issue #20 (Gestión de Menú y Catálogo de Productos):**
  * CRUD completo de productos con modal accesible `ProductoModal.jsx` (`POST`, `PATCH`, `DELETE /api/products/`).
  * Switch reactivo de disponibilidad gastronómica inmediata (`is_available`) con actualización optimista y feedback visual.
  * Buscador en tiempo real de ítems del menú con badge de stock y estado visual.
* [x] **Issue #21 (Monitor de Pedidos y Despacho en Cocina):**
  * Monitor de comandas en tiempo real con filtrado por estados (Todos, Pendientes, En Preparación, En Reparto, Entregados, Cancelados).
  * Flujo de avance de estado de despacho según roles: Aceptar y Preparar (`preparing`), Despachar (`delivering`), Marcar Entregado (`delivered`) y Cancelar (`cancelled`).
  * Desglose completo de clientes, notas de entrega, ítems solicitados y montos totales por pedido.

### 🖼️ Pipeline Multimedia y Assets de Imágenes
* [x] Configuración de Django Media en `settings.py` (`MEDIA_URL = '/media/'`, `MEDIA_ROOT = BASE_DIR / 'media'`) y `urls.py`.
* [x] Script `scripts/download_images.py` ejecutado: 6 tiendas y 29 productos provistos de imágenes reales representativas de alta calidad en `media/` y `frontend/public/images/`.
* [x] Helper `imageUrl.js` con tests unitarios: compatibilidad total con rutas de backend, URLs remotas y assets locales, con manejo de fallback visual (`onError`) ante fallas de carga.

### 🧪 Aseguramiento de Calidad y Cobertura de Tests
* [x] **Frontend:** 139 tests unitarios e integrados pasando al 100% en Vitest (24 suites de prueba).
* [x] **Backend:** 60 tests automatizados pasando al 100% en Django REST Framework (`python manage.py test`).
* [x] **Linter:** 0 errores y 0 warnings en ESLint (`npm run lint`).
* [x] **Build:** Verificación exitosa de bundle de producción con Vite (`npm run build`).

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
