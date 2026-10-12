# frontend/ - Cliente React (TP5, TP6, TP7, TP8 y TP9)

Cliente single-page de la app de pedidos (estilo PedidosYa), creado con Vite + React.
Vive al nivel del backend (mismo repositorio) y consume la API Django vía JSON + JWT.

## Stack

* React 19
* Vite 8 (dev server con HMR)
* Bootstrap 5 + bootstrap-icons (sistema de diseño responsive)
* Poppins (tipografía oficial FoodRush)
* Vitest + React Testing Library (TDD y tests automatizados)
* JavaScript (JSX)
* npm (Node.js)

## Requisitos

* Node.js `^20.19 || >=22.12` (requisito de Vite 8; probado con v24.19.0)

## Cómo correr

```bash
npm install      # primera vez
npm run dev      # dev server en http://localhost:3000
```

### Scripts de prueba y construcción

* `npm test` - ejecuta la suite completa de 129 tests unitarios e integrados con Vitest
* `npm run lint` - valida reglas de Clean Code con ESLint (0 errores, 0 warnings)
* `npm run build` - compila el bundle optimizado para producción
* `npm run preview` - previsualiza localmente el build compilado

## Puertos

* Frontend (Vite): `http://localhost:3000` (configurado en `vite.config.js`)
* Backend (Django REST Framework): `http://localhost:8000/api/`
* Multimedia Backend: `http://localhost:8000/media/`

## Arquitectura y Mapeo de Vistas (TP9)

El detalle exhaustivo y diagramas de arquitectura se encuentran en:
* [`docs/diagrama.md`](../docs/diagrama.md)
* [`docs/mapeo_vistas_tp9.md`](../docs/mapeo_vistas_tp9.md)

### Rutas Disponibles

| Ruta | Vista | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `/` | `Home.jsx` | Público / Auth | Portada con categorías, tiendas destacadas, buscador y selector de dirección activa. |
| `/tiendas` · `/explorar` | `Stores.jsx` | Público | Catálogo interactivo de tiendas con filtro por categorías gastronómicas y buscador. |
| `/tiendas/:id` | `StoreDetail.jsx` | Público | Carta de productos del comercio, modal de producto y botón de compra. |
| `/carrito` | `Cart.jsx` | Autenticado | Carrito mono-tienda, incremento/decremento de cantidades (+ / -) y subtotal en tiempo real. |
| `/checkout` | `Checkout.jsx` | Autenticado | Formulario transaccional con dirección y teléfono prellenados, pago simulado y confirmación. |
| `/perfil` | `Profile.jsx` (tab perfil) | Autenticado | Edición de datos personales y gestión de direcciones múltiples guardadas. |
| `/pedidos` | `Profile.jsx` (tab pedidos) | Autenticado | Historial cronológico de órdenes, desglose de items y seguimiento de estado. |
| `/login` | `Login.jsx` | Invitados | Autenticación JWT por email y contraseña. |
| `/register` | `Register.jsx` | Invitados | Registro público de usuario cliente. |

## Contextos Globales (State Management)

1. **`AuthContext.jsx`:**
   - Manejo de sesión con JWT (`access_token`, `refresh_token`, datos del usuario).
   - Silent refresh automático de tokens antes del vencimiento.
   - Rutas protegidas mediante `<ProtectedRoute>`.
2. **`CartContext.jsx`:**
   - Estado del carrito mono-tienda sincronizado con backend (`GET /api/carts/`, `POST/PATCH/DELETE /api/cart-items/`).
   - Cálculo reactivo de totales, cantidad de items y validación de stock disponible.
3. **`AddressContext.jsx`:**
   - Gestión integral de direcciones guardadas (`Casa`, `Hotel`, `Trabajo`, etc.).
   - Selección de dirección activa que se refleja en el Navbar y autocompleta el formulario de Checkout.

## Servicios Desacoplados (`src/services/`)

* `authService.js`: login, registro, logout con blacklist, refresh de token.
* `storeService.js`: consulta de tiendas y categorías gastronómicas.
* `productService.js`: búsqueda y consulta de productos por comercio.
* `cartService.js`: mutaciones del carrito mono-tienda.
* `orderService.js`: creación transaccional de órdenes e historial de pedidos.
* `profileService.js`: lectura y actualización de datos de usuario.

## Manejo de Imágenes y Multimedia

* Las imágenes de tiendas y productos son servidas por Django Media o assets locales.
* Utilidad `src/utils/imageUrl.js` (`getImageUrl`): normaliza rutas relativas del backend DRF y provee fallbacks visuales seguros ante errores de carga (`onError`).
* Todas las 6 tiendas y 29 productos cuentan con imágenes reales vinculadas.