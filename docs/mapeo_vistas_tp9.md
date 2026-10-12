# 🗺️ Mapeo de Vistas y Endpoints - TP9 (Full Views & Funcionalidad)

Este documento define la arquitectura y el mapeo integral entre los endpoints REST del backend Django y las vistas de React (React Router v7 / Vite) en FoodRush.

---

## 📋 Matriz de Vistas, Rutas y Endpoints

| Categoría | Vista / Pantalla | Ruta en Frontend | Nivel de Acceso / Roles | Endpoints Backend DRF | Propósito & Funcionalidad | Estado de Implementación |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Pública** | `Home` | `/` | Público (o Auth) | `GET /api/stores/`<br>`GET /api/products/` | Portada con categorías destacadas, tiendas activas y selector de dirección. | ✅ Implementada & Testeada (M1) |
| **Pública** | `Stores` | `/tiendas` · `/explorar` | Público | `GET /api/stores/`<br>`GET /api/products/` | Catálogo de comercios con buscador en tiempo real y filtro de 5 categorías gastronómicas. | ✅ Implementada & Testeada (M1 / #38) |
| **Pública** | `StoreDetail` | `/tiendas/:id` | Público | `GET /api/stores/:id/`<br>`GET /api/products/?store=:id` | Perfil del comercio gastronómico y su carta/menú de productos. | ✅ Implementada & Testeada (M1 / #13) |
| **Pública** | `ProductDetail` | Modal en `StoreDetail` | Público | `GET /api/products/:id/` | Ficha técnica del producto: foto, descripción, precio, stock y agregar al carrito. | ✅ Implementada & Testeada (M1 / #13) |
| **Pública** | `Login` | `/login` | Solo Invitados | `POST /api/token/` | Autenticación JWT por email y password. | ✅ Implementada & Testeada (TP8) |
| **Pública** | `Register` | `/register` | Solo Invitados | `POST /api/register/` | Creación de cuenta cliente con validaciones en cliente y backend. | ✅ Implementada & Testeada (TP8) |
| **Autenticada** | `Cart` | `/carrito` | Autenticado (`cliente`, `vendedor`, `admin`) | `GET /api/carts/`<br>`POST, PATCH, DELETE /api/cart-items/` | Visualización del carrito mono-tienda, incremento/decremento de cantidades y subtotal reactivo. | ✅ Implementada & Testeada (M1 / #14, #15) |
| **Autenticada** | `Checkout` | `/checkout` | Autenticado (`cliente`, `vendedor`, `admin`) | `GET /api/carts/`<br>`POST /api/orders/` | Formulario con dirección y teléfono prellenados, pago simulado y confirmación transaccional. | ✅ Implementada & Testeada (M2 / #16, #17) |
| **Autenticada** | `Orders` | `/pedidos` | Autenticado (`cliente`, `vendedor`, `admin`) | `GET /api/orders/`<br>`PATCH /api/orders/:id/` | Historial cronológico de pedidos del usuario, estado de preparación y desglose de items. | ✅ Implementada & Testeada (M2 / #18) |
| **Autenticada** | `Profile` | `/perfil` | Autenticado (`cliente`, `vendedor`, `admin`) | `GET /api/profile/`<br>`PATCH /api/profile/` | Información de cuenta, actualización de nombre/teléfono y gestión de direcciones múltiples guardadas. | ✅ Implementada & Testeada (M2 / #18) |
| **Admin / Vendedor** | `AdminProducts` | `/admin/productos` | Roles: `vendedor`, `admin` | `GET, POST, PUT, DELETE /api/products/`<br>`GET /api/stores/` | Dashboard de gestión de catálogo: alta de producto, edición de precio/stock, borrado y estado `is_available`. | ⏳ Planificada (Milestone 3 / #19, #20) |
| **Admin / Vendedor** | `AdminOrders` | `/admin/pedidos` | Roles: `vendedor`, `admin` | `GET /api/orders/`<br>`PATCH /api/orders/:id/` | Monitor de cocina / despacho: avanzar pedidos de `pending` -> `preparing` -> `delivering` -> `delivered`. | ⏳ Planificada (Milestone 3 / #21) |
| **Admin** | `AdminUsers` | `/admin/usuarios` | Rol exclusivo: `admin` | `GET, PATCH /api/users/` | Panel de moderación de usuarios, cambio de roles y control de acceso. | ⏳ Planificada (Milestone 5 / #25) |

---

## 🛡️ Reglas de Seguridad y Control de Acceso (`ProtectedRoute`)

1. **Rutas Públicas:** Accesibles para cualquier visitante anónimo. Si el usuario está autenticado, se visualiza su información en el Navbar y tiene acceso directo a acciones de compra.
2. **Rutas Autenticadas Generales:** Protegidas mediante `<ProtectedRoute>`. Si no existe sesión válida o el JWT expiró, se redirige a `/login` preservando la ruta previa en el estado de navegación (`location.state.from`).
3. **Rutas Administrativas con RBAC (Role-Based Access Control):** Protegidas mediante `<ProtectedRoute allowedRoles={['admin', 'vendedor']}>`.
   - Si un usuario con rol `cliente` intenta acceder directamente a `/admin/productos` o `/admin/pedidos`, el componente bloquea el acceso y redirige a `/` con un estado de error o renderiza una pantalla de "Acceso No Autorizado (403)".
   - Si no está autenticado, redirige a `/login`.

---

## 🧩 Estados Obligatorios de UI por Vista (Clean Code & UX)

Para cumplir los criterios de aprobación de TP9, cada vista debe implementar:
1. **Estado de Carga (Loading State):** Spinner centrado o skeletons accesibles mientras la promesa de la API está pendiente.
2. **Estado de Error (Error Boundary / Alert):** Mensaje amigable con botón de reintento (`Reintentar`) ante fallas de red o respuestas `4xx`/`5xx`.
3. **Estado Vacío (Empty State):** Mensajes informativos con llamada a la acción (ej. *"Tu carrito está vacío. ¡Explorá nuestros platos!"* o *"No se encontraron productos coincidentes"*).
4. **Estado de Datos Reales:** Renderizado dinámico estricto; imágenes reales de tiendas y productos provistas por backend o fallback visual.

---

## 🧪 Métricas de Verificación de TP9 (Milestones 1 & 2)

* **Tests Frontend:** 129 tests unitarios e integrados pasando al 100% en Vitest (23 suites de pruebas).
* **Tests Backend:** 57 tests automatizados pasando al 100% en Django REST Framework.
* **ESLint:** 0 errores y 0 warnings en todo el código fuente de `frontend/`.
* **Milestones Cerrados:** Milestone 1 y Milestone 2 cerrados formalmente en GitHub con todos sus issues y criterios de aceptación cumplidos.
