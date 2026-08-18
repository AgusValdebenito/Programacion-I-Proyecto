# Bosquejo de diseño - Home del frontend

> TP5: documento de diseño inicial. Este es el punto de partida del cliente React.
> La estructura describe componentes y flujo; la implementación arranca en TPs siguientes.

## Vista general (estructura de componentes)

```
App (raíz)
├── Navbar
│   ├── Logo (FoodRush)
│   ├── Buscador de productos/tiendas
│   ├── Link "Tiendas"
│   └── AuthMenu
│       ├── (sin sesión) Login | Registrarse
│       └── (con sesión) Mi Perfil | Carrito | Cerrar sesión
├── Home
│   ├── Hero (título + descripción)
│   ├── StoreList
│   │   └── StoreCard (por cada tienda)
│   └── FeaturedProducts
│       └── ProductCard (por cada producto destacado)
└── Footer
```

## Flujo principal (navegación)

```
[Home (lista de tiendas y productos)]  →  [Detalle de tienda (sus productos)]
                                             ↓ agregar al carrito
      [Carrito]  →  [Confirmar pedido]  →  [Historial de pedidos / Perfil]
```

## Rutas pensadas (client-side)

| Ruta | Vista | Componente principal |
| :--- | :--- | :--- |
| `/` | Home con tiendas y productos | `Home` |
| `/tiendas/:id` | Tienda con sus productos | `StoreDetail` |
| `/carrito` | Carrito del usuario | `Cart` |
| `/login` `/registro` | Autenticación | `AuthPage` |
| `/perfil` | Datos del usuario y sus pedidos | `Profile` |

## Componentes clave

* **Navbar**: navegación fija superior. Muestra menú según sesión (usa el estado de auth global).
* **Home**: agrupa Hero + StoreList + ProductCard. Consume `GET /api/stores/` y `GET /api/products/`.
* **StoreCard**: imagen, nombre, categoría. Botón para ir al detalle de la tienda.
* **ProductCard**: imagen, nombre, precio, tienda, stock. Botón "Agregar" (solo si stock > 0).
* **Cart**: lista de `CartItem` con cantidades, total y botón confirmar pedido.
* **AuthPage**: formularios de login (`POST /api/token/`) y registro (`POST /api/register/`).
* **Profile**: muestra el perfil (`GET /api/profile/`) y el historial de pedidos.

## Flujo de datos (frontend ↔ API)

```
React (frontend, http://localhost:3000)
   │  fetch con Authorization: Bearer <token JWT>
   ▼
Django REST API (http://localhost:8000/api/)
   │ JWT auth + permisos por rol (cliente/vendedor/admin)
   ▼
PostgreSQL
```

* El token JWT se guarda en `localStorage` (o `sessionStorage`) tras el login.
* El estado de autenticación se maneja con contexto de React (`AuthContext`).
* Los llamados a la API viven en servicios separados (`src/api/`), no dentro de los componentes.

## Pendiente (para TPs siguientes)

* [ ] Instalar `react-router-dom` para las rutas client-side
* [ ] Crear `src/api/` con los servicios del backend
* [ ] Contexto de autenticación (`AuthContext`)
* [ ] Maquetado de la Home consumiendo los endpoints reales