# Especificacion de Roles, Permisos y Reglas de Negocio en FoodRush

Este documento define con precision los roles del sistema, la matriz de permisos sobre los endpoints y las reglas de negocio implementadas en la plataforma **FoodRush**.

---

## 1. Definicion de Roles

### 1. Cliente (`cliente`)
Es el rol predeterminado asignado a todo usuario nuevo al registrarse.

**Capacidades y permisos:**
- **Exploracion:** Consultar libremente el catalogo publico de tiendas y productos (nombre, descripcion, precio, fotos y disponibilidad).
- **Gestion de Carrito:**
  - Dispone de un unico carrito personal.
  - Puede agregar productos disponibles (`is_available = True`).
  - **Regla Mono-tienda:** El carrito solo puede contener productos de una unica tienda a la vez. Si el cliente desea agregar un producto de otra tienda, debe vaciar su carrito actual.
- **Gestion de Pedidos:**
  - Puede crear pedidos asociados a una unica tienda (`store`).
  - Puede consultar el historial y estado de sus propios pedidos.
  - **Cancelacion:** Puede cancelar un pedido (`status = cancelled`) unicamente mientras se encuentre en estado `pending` (Pendiente).
- **Restricciones:**
  - No puede crear, modificar ni eliminar tiendas o productos.
  - No puede modificar precios, descripciones, disponibilidad ni imagenes.
  - No puede avanzar estados de entrega del pedido (no puede marcar como `preparing`, `delivering` o `delivered`).

---

### 2. Tienda / Vendedor (`vendedor`)
Rol asignado a usuarios que administran un comercio dentro de la plataforma (asignado automaticamente al crear una tienda).

**Capacidades y permisos:**
- **Gestion de Tienda:** Puede modificar los datos de su propia tienda y su imagen (`image`).
- **Gestion de Productos:**
  - Crear nuevos productos asociados a su tienda.
  - Modificar nombre, precio, descripcion e imagen de sus productos.
  - Activar o pausar la disponibilidad inmediata de un producto mediante el campo `is_available` (booleano).
  - Eliminar productos de su catalogo.
- **Gestion de Pedidos Recibidos:**
  - Puede visualizar todos los pedidos realizados a su tienda.
  - Es el unico actor autorizado para hacer progresar el flujo de preparacion y entrega del pedido:
    `Pending -> Preparing -> Delivering -> Delivered`
  - Puede cancelar un pedido (`cancelled`) en caso de inconvenientes.
- **Restricciones:**
  - No puede ver ni editar informacion, productos o pedidos de otras tiendas.
  - Cada vendedor puede poseer un maximo de una tienda asociada (`OneToOneField`).

---

### 3. Administrador (`admin` / `is_staff`)
Usuario con privilegios globales de supervision, moderacion y mantenimiento de la plataforma.

**Capacidades y permisos:**
- **Moderacion Global:**
  - Eliminar manualmente cualquier tienda o producto que incumpla las normas.
  - Suspender o dar de baja usuarios.
  - Acceso irrestricto de consulta y modificacion en casos excepcionales de soporte o disputa.

---

## 2. Matriz de Permisos por Endpoint

| Endpoint | Metodo | Cliente | Vendedor | Administrador |
| :--- | :---: | :---: | :---: | :---: |
| `/api/stores/` | `GET` | Publico | Publico | Total |
| `/api/stores/` | `POST` | Si no tiene tienda previa | Denegado (ya tiene tienda) | Total |
| `/api/stores/{id}/` | `PATCH`/`PUT`/`DELETE` | Solo si es el dueno | Solo su propia tienda | Total |
| `/api/products/` | `GET` | Publico | Publico | Total |
| `/api/products/` | `POST`/`PUT`/`DELETE` | Denegado | Solo productos de su tienda | Total |
| `/api/cart/` | `GET`/`POST` | Su propio carrito | Su propio carrito | Total |
| `/api/cart-items/` | `POST` | Solo productos `is_available` y misma tienda | Mismas reglas de cliente | Total |
| `/api/orders/` | `GET` | Solo sus pedidos | Sus compras y pedidos de su tienda | Total |
| `/api/orders/` | `POST` | Solo sus pedidos | Solo sus pedidos | Total |
| `/api/orders/{id}/` | `PATCH` | Solo `cancelled` si esta `pending` | Transicion `preparing` -> `delivering` -> `delivered` | Total |

---

## 3. Diagrama de Transicion de Estados de Pedido

```
  [ PENDING ] ---> [ PREPARING ] ---> [ DELIVERING ] ---> [ DELIVERED ]
       |                 |                  |
       +---> [ CANCELLED ]                  +---> [ CANCELLED ]
```
