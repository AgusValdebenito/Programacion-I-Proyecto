# Trabajo Práctico N°9

## Vistas Completas y Funcionalidad

### 🎯 Objetivo

Construir **todas las vistas faltantes** de la aplicación, conectadas a la API real. Este TP es donde la app deja de ser un prototipo de Login/Home y se convierte en una **aplicación funcional completa**: catálogo, detalle de producto, carrito de compras, checkout, y panel de administración.

---

### 🧠 Fundamento Técnico: ¿Por qué hacemos esto?

#### 1\. Consolidación, no contenido nuevo

Hasta ahora aprendiste los bloques fundamentales:

- **TP6**: contexto de autenticación y rutas protegidas.  
- **TP7**: vistas estáticas con Bootstrap.  
- **TP8**: conexión de esas vistas a la API real.

Este TP **no enseña conceptos nuevos**. Aplica lo que ya sabés para construir la totalidad de la aplicación. Es la diferencia entre "saber hacer un login" y "saber construir un sistema completo".

#### 2\. La regla de oro: nada hardcodeado

A diferencia del TP6/TP7, **todos los datos vienen de la API**. No existe un `const productos = [...]` en el código. Si la API no tiene datos, la vista queda vacía. Si la API devuelve un error, la vista lo muestra. Esto es una aplicación real.

#### 3\. Separación de responsabilidades

Cada vista tiene una función clara:

- **Vistas de lectura**: catálogo, detalle, búsqueda.  
- **Vistas de escritura**: carrito, checkout, formulario de registro.  
- **Vistas de administración**: panel para gestionar productos, usuarios, pedidos.

No todo es una página igual. Aprendé a decidir qué componente renderiza qué cosa.

---

### 🛠️ Actividades

#### Paso 1: Mapear las vistas necesarias

1. Revisar los endpoints de la API (Swagger/Redoc o `urls.py` del backend).  
2. Listar **todas las vistas** que faltan en el frontend. Ejemplo típico:  
   - **Públicas**: catálogo de productos, detalle de producto, búsqueda.  
   - **Autenticadas**: carrito de compras, checkout, historial de pedidos, perfil de usuario.  
   - **Admin**: gestión de productos (CRUD), gestión de usuarios, reportes/pedidos.  
3. Crear la rama de trabajo:  
     
   git checkout \-b feature/full-views

#### Paso 2: Construir las vistas de catálogo

1. **Vista de catálogo**: listado de productos con datos reales de la API.  
   - Usar `fetch` o `axios` para hacer `GET` al endpoint de productos.  
   - Mostrar nombre, imagen, precio y un link al detalle.  
2. **Vista de detalle**: al hacer click en un producto, mostrar toda su información.  
   - Obtener el `id` del producto desde la URL (React Router params).  
   - Hacer `GET` al endpoint específico del producto.  
3. **Búsqueda/filtros**: si la API lo soporta, agregar filtrado por categoría, precio, etc.

#### Paso 3: Construir las vistas de usuario autenticado (si corresponde)

1. **Carrito de compras**:  
   - Obtener el carrito del usuario desde la API.  
   - Permitir agregar, modificar cantidad y eliminar ítems.  
   - Mostrar el total.  
2. **Checkout**:  
   - Formulario de dirección y método de pago.  
   - Enviar el pedido a la API (`POST`).  
   - Mostrar confirmación o error.  
3. **Historial de pedidos**:  
   - `GET` a los pedidos del usuario.  
   - Listado con estado, fecha y detalle.  
4. **Perfil de usuario**:  
   - Ver y editar datos personales.

#### Paso 4: Construir el panel de administración

1. **Gestión de productos**:  
   - Listado completo con opciones de editar/eliminar.  
   - Formulario de creación de productos.  
   - Usar los permisos del backend: solo `ADMIN` o `VENDEDOR` pueden crear/editar.  
2. **Gestión de usuarios** (si aplica):  
   - Listado de usuarios registrados.  
   - Cambio de roles o inhabilitación.  
3. **Pedidos/Reportes** (si aplica):  
   - Listado de todos los pedidos.  
   - Cambio de estado del pedido.

#### Paso 5: Proteger rutas y manejar permisos

1. Verificar que las vistas de admin **solo sean accesibles** para usuarios con rol `ADMIN` o `VENDEDOR`.  
2. Si un usuario sin permisos intenta acceder, redirigir al Home o mostrar un mensaje de "No autorizado".  
3. Las vistas de usuario (carrito, checkout, perfil) deben estar protegidas por `ProtectedRoute`.

#### Paso 6: Manejo de estados de carga y error

1. Cuando la API tarda en responder, mostrar un **spinner o mensaje de carga**.  
2. Si la API devuelve un error (404, 500), mostrar una **vista de error** clara.  
3. Si el carrito está vacío, mostrar un mensaje amigable en vez de una página en blanco.

---

### 📦 Entregables

1. **Vistas públicas**: catálogo y detalle de productos funcionando con datos reales.  
2. **Vistas autenticadas**: carrito, checkout, historial de pedidos y perfil.  
3. **Panel de administración**: CRUD de productos con permisos por rol.  
4. **Protección de rutas**: admin solo accesible para ADMIN/VENDEDOR.  
5. **Estados de carga y error**: la app no se rompe si la API falla o tarda.

---

### ✅ Criterios de aprobación

- Todas las vistas muestran datos reales de la API (nada hardcodeado).  
- Un usuario sin permisos de admin **no puede** acceder a las vistas de administración.  
- El carrito permite agregar, modificar y eliminar ítems correctamente.  
- El checkout envía el pedido a la API y muestra confirmación.  
- La app muestra loading spinner durante las peticiones y mensajes de error claros.  
- Los cambios están en la rama `feature/full-views` con commits descriptivos.

