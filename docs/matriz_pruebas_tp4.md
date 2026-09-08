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
| **NEG-04** | `/api/cart-items/` | `POST` | `CLIENTE` | Agregar producto de una tienda B teniendo items de tienda A | `400 Bad Request` (Regla Mono-tienda) | `400 Bad Request` | ✅ PASS |
| **NEG-05** | `/api/cart-items/` | `POST` | `CLIENTE` | Re-agregar el mismo producto al carrito | `200 OK` (incrementa cantidad, no duplica) | `200 OK` | ✅ PASS |
| **NEG-06** | `/api/orders/{id}/` | `PATCH` | `CLIENTE` | Intentar marcar pedido como `delivered` | `403 Forbidden` (solo vendedor/admin) | `403 Forbidden` | ✅ PASS |
| **NEG-07** | `/api/orders/{id}/` | `PATCH` | `CLIENTE` | Cancelar pedido propio en estado `pending` | `200 OK` (`status: cancelled`) | `200 OK` | ✅ PASS |
| **NEG-08** | `/api/orders/{id}/` | `PATCH` | `VENDEDOR` (dueno) | Transicionar estado `pending` -> `preparing` -> `delivering` -> `delivered` | `200 OK` | `200 OK` | ✅ PASS |
| **NEG-09** | `/api/orders/{id}/` | `PATCH` | `VENDEDOR` (ajeno) | Intentar alterar estado de pedido de otra tienda | `404 Not Found` o `403 Forbidden` | `404 Not Found` | ✅ PASS |
| **NEG-10** | `/api/order-items/` | `POST` | `CLIENTE` | Agregar item con producto de otra tienda al pedido | `400 Bad Request` (Regla Mono-tienda pedido) | `400 Bad Request` | ✅ PASS |

---

### 1.3 Pruebas de Flujo Completo (End-to-End)

| ID | Flujo | Pasos Ejecutados | Resultado Esperado | Resultado Obtenido | Estado |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **FLUJO-01** | **Flujo Completo de Compra y Despacho** | 1. Registro e inicio de sesion del cliente (`POST /api/token/`)<br>2. Consulta de catalogo y tiendas (`GET /api/products/`)<br>3. Agregado de items al carrito (`POST /api/cart-items/`)<br>4. Creacion del pedido (`POST /api/orders/`)<br>5. Despacho por la tienda (`PATCH /api/orders/{id}/` a `preparing`, `delivering`, `delivered`) | Flujo completado sin inconsistencias y respetando autorizaciones en cada paso | Completado con exito | ✅ PASS |

---

## 2. Deteccion y Correccion de Errores (Ciclo de Vida de Bugs)

Durante el proceso de validacion de la API para el TP4, se detectaron los siguientes casos de borde que fueron corregidos en el backend:

1. **Bug #1: Mezcla de productos de distintas tiendas en el mismo carrito / pedido.**
   - *Comportamiento previo:* El carrito permitia agregar productos de multiples comercios simultaneamente.
   - *Correccion:* Se agrego validacion en `CartItemViewSet.create` y `OrderItemViewSet.perform_create` para garantizar la regla de mono-tienda (`400 Bad Request`).
2. **Bug #2: Clientes podian forzar el estado de entrega (`delivered`) de sus pedidos.**
   - *Comportamiento previo:* Al tener permisos de propietario sobre el pedido, el cliente podia editar libremente `status`.
   - *Correccion:* Se implemento `OrderViewSet.perform_update` restringiendo el avance de estados a la tienda duena y permitiendo al cliente unicamente cancelar si esta `pending`.
3. **Bug #3: Productos no disponibles podian ser agregados al carrito.**
   - *Comportamiento previo:* No existia flag de disponibilidad en el modelo.
   - *Correccion:* Se anadio `is_available = BooleanField(default=True)` y validacion previa en el endpoint de items.

---

## 3. Coleccion de Postman Exportada

La coleccion completa de Postman se encuentra exportada y lista para importar en el repositorio:
📁 `postman/FoodRush_TP4.postman_collection.json`

Contiene las 3 carpetas requeridas:
1. `01 - Roles y Permisos (CRUD)`
2. `02 - Logica de Negocio y Casos de Borde`
3. `03 - Flujos Completos`
