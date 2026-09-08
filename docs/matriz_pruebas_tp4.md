# Reporte y Matriz de Pruebas - Trabajo Practico N°4
## Validacion de API, Casos de Borde y Matriz de Permisos por Rol

**Proyecto:** FoodRush (App de Pedidos)  
**Entorno de pruebas:** Local (`http://localhost:8000/api/`)  
**Herramienta de ejecucion:** Postman Collection v2.1 / Django Test Runner  

---

## 1. Diseno de la Matriz de Pruebas

Esta matriz define los escenarios de prueba para validar que la separacion de roles (**Cliente**, **Vendedor/Tienda**, **Administrador**) y las reglas de negocio se cumplan estrictamente.

### 1.1 Pruebas de Roles y Permisos (CRUD y Autorizacion)

| ID | Endpoint | Metodo | Rol Utilizado | Accion / Descripcion | Resultado Esperado | Resultado Obtenido | Estado |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- | :---: |
| **ROL-01** | `/api/products/` | `GET` | Anonimo / Todos | Listar productos publicamente | `200 OK` (catalogo visible) | `200 OK` | ✅ PASS |
| **ROL-02** | `/api/products/` | `POST` | `CLIENTE` | Intentar crear un producto sin ser tienda | `403 Forbidden` | `403 Forbidden` | ✅ PASS |
| **ROL-03** | `/api/products/` | `POST` | `VENDEDOR` (dueno) | Publicar un producto para su tienda | `201 Created` | `201 Created` | ✅ PASS |
| **ROL-04** | `/api/products/{id}/` | `DELETE` | `CLIENTE` | Intentar borrar un producto del catalogo | `403 Forbidden` | `403 Forbidden` | ✅ PASS |
| **ROL-05** | `/api/products/{id}/` | `DELETE` | `VENDEDOR` (ajeno) | Intentar borrar producto de otra tienda | `403 Forbidden` | `403 Forbidden` | ✅ PASS |
| **ROL-06** | `/api/products/{id}/` | `DELETE` | `ADMIN` | Moderar y eliminar un producto ajeno | `204 No Content` | `204 No Content` | ✅ PASS |
| **ROL-07** | `/api/stores/` | `POST` | `CLIENTE` | Crear tienda propia (auto-promocion a vendedor) | `201 Created` | `201 Created` | ✅ PASS |
| **ROL-08** | `/api/stores/` | `POST` | `VENDEDOR` | Intentar crear una segunda tienda | `400 Bad Request` | `400 Bad Request` | ✅ PASS |
| **ROL-09** | `/api/stores/{id}/` | `DELETE` | `CLIENTE` | Intentar borrar una tienda ajena | `403 Forbidden` | `403 Forbidden` | ✅ PASS |
| **ROL-10** | `/api/stores/{id}/` | `DELETE` | `ADMIN` | Moderar y eliminar una tienda | `204 No Content` | `204 No Content` | ✅ PASS |

---

### 1.2 Pruebas de Logica de Negocio y Casos de Borde (Edge Cases)

| ID | Endpoint | Metodo | Rol Utilizado | Accion / Descripcion | Resultado Esperado | Resultado Obtenido | Estado |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- | :---: |
| **NEG-01** | `/api/register/` | `POST` | Anonimo | Registro con email ya existente | `400 Bad Request` ("email ya existe") | `400 Bad Request` | ✅ PASS |
| **NEG-02** | `/api/products/` | `POST` | `VENDEDOR` | Crear producto con precio negativo (`-10.00`) | `400 Bad Request` (validador MinValue) | `400 Bad Request` | ✅ PASS |
| **NEG-03** | `/api/cart-items/` | `POST` | `CLIENTE` | Agregar producto no disponible (`is_available=False`) | `400 Bad Request` ("no disponible") | `400 Bad Request` | ✅ PASS |
| **NEG-04** | `/api/cart-items/` | `POST` | `CLIENTE` | Agregar cantidad que supera el stock disponible | `400 Bad Request` ("stock insuficiente") | `400 Bad Request` | ✅ PASS |
| **NEG-05** | `/api/cart-items/` | `POST` | `CLIENTE` | Agregar producto de una tienda B teniendo items de tienda A | `400 Bad Request` (Regla Mono-tienda) | `400 Bad Request` | ✅ PASS |
| **NEG-06** | `/api/cart-items/` | `POST` | `CLIENTE` | Re-agregar el mismo producto al carrito | `200 OK` (incrementa cantidad, no duplica) | `200 OK` | ✅ PASS |
| **NEG-07** | `/api/orders/` | `POST` | `CLIENTE` | Intentar crear pedido sin tienda asociada | `400 Bad Request` (campo `store` requerido) | `400 Bad Request` | ✅ PASS |
| **NEG-08** | `/api/orders/{id}/` | `PATCH` | `CLIENTE` | Intentar marcar pedido como `delivered` | `403 Forbidden` (solo vendedor/admin) | `403 Forbidden` | ✅ PASS |
| **NEG-09** | `/api/orders/{id}/` | `PATCH` | `CLIENTE` | Cancelar pedido propio en estado `pending` | `200 OK` (`status: cancelled`) | `200 OK` | ✅ PASS |
| **NEG-10** | `/api/orders/{id}/` | `PATCH` | `VENDEDOR` (dueno) | Transicionar estado `pending` -> `preparing` -> `delivering` -> `delivered` | `200 OK` | `200 OK` | ✅ PASS |
| **NEG-11** | `/api/orders/{id}/` | `PATCH` | `VENDEDOR` (dueno) | Intentar cancelar un pedido ya entregado (`delivered`) | `400 Bad Request` | `400 Bad Request` | ✅ PASS |
| **NEG-12** | `/api/orders/{id}/` | `PATCH` | `VENDEDOR` (ajeno) | Intentar alterar estado de pedido de otra tienda | `404 Not Found` | `404 Not Found` | ✅ PASS |
| **NEG-13** | `/api/order-items/` | `POST` | `CLIENTE` | Agregar item con producto de otra tienda al pedido | `400 Bad Request` (Regla Mono-tienda pedido) | `400 Bad Request` | ✅ PASS |
| **NEG-14** | `/api/order-items/` | `POST` | `CLIENTE` | Intentar enviar `unit_price` manipulado | `201 Created` (unit_price forzado desde el producto) | `201 Created` | ✅ PASS |

---

### 1.3 Pruebas de Flujo Completo (End-to-End)

| ID | Flujo | Pasos Ejecutados | Resultado Esperado | Resultado Obtenido | Estado |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **FLUJO-01** | **Flujo Completo de Compra y Despacho** | 1. Registro e inicio de sesion del cliente (`POST /api/token/`)<br>2. Consulta de catalogo, stock y tiendas (`GET /api/products/`)<br>3. Agregado de items al carrito con validacion de stock (`POST /api/cart-items/`)<br>4. Creacion del pedido vinculado a la tienda (`POST /api/orders/`)<br>5. Despacho por la tienda (`PATCH /api/orders/{id}/` a `preparing`, `delivering`, `delivered`) | Flujo completado sin inconsistencias y respetando autorizaciones en cada paso | Completado con exito | ✅ PASS |

---

## 2. Deteccion y Correccion de Errores (Ciclo de Vida de Bugs)

Durante el proceso de validacion de la API para el TP4 y el code review, se detectaron los siguientes casos de borde que fueron corregidos en el backend:

1. **Bug #1: Pedidos huerfanos sin tienda asociada (`Order.store` nullable).**
   - *Comportamiento previo:* El modelo permitia `null=True`, pudiendo originar pedidos sin tienda y errores `AttributeError` en permisos.
   - *Correccion:* Se hizo obligatorio el campo `store = ForeignKey(Store, on_delete=models.PROTECT)` con validacion en la creacion del pedido.
2. **Bug #2: Ausencia de control de stock en productos e items.**
   - *Comportamiento previo:* No habia campo `stock` ni validacion de inventario al comprar o agregar al carrito.
   - *Correccion:* Se agrego el campo `stock` a `Product` y validaciones en `CartItemViewSet` y `OrderItemViewSet` que impiden superar el stock disponible (`400 Bad Request`).
3. **Bug #3: Mezcla de productos de distintas tiendas en el mismo carrito / pedido.**
   - *Comportamiento previo:* El carrito y pedido permitian agregar productos de multiples comercios simultaneamente.
   - *Correccion:* Se agrego validacion estricta mono-tienda en `CartItemViewSet` y `OrderItemViewSet`.
4. **Bug #4: Clientes podian forzar el estado de entrega (`delivered`) o vendedores cancelar pedidos ya entregados.**
   - *Comportamiento previo:* Los clientes podian editar libremente el estado y el vendedor podia cancelar en cualquier instancia.
   - *Correccion:* Se restringio el flujo en `OrderViewSet.perform_update` (`pending` -> `preparing` -> `delivering` -> `delivered`) impidiendo transiciones invalidas o cancelaciones post-entrega.
5. **Bug #5: Manipulacion del precio unitario (`unit_price`) en items de pedido.**
   - *Comportamiento previo:* El cliente podia enviar un `unit_price` arbitrario en el body JSON.
   - *Correccion:* Se configuro `unit_price` como de solo lectura en el serializer y se asigna obligatoriamente desde `product.price` en backend.

---

## 3. Coleccion de Postman Exportada

La coleccion completa de Postman se encuentra exportada y lista para importar en el repositorio:
📁 `postman/FoodRush_TP4.postman_collection.json`

Contiene las 3 carpetas requeridas:
1. `01 - Roles y Permisos (CRUD)`
2. `02 - Logica de Negocio y Casos de Borde`
3. `03 - Flujos Completos`
