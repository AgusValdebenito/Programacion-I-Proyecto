# Programacion-I-Proyecto

# 🍔 App de Pedidos (Tipo PedidosYa)

Aplicacion web full-stack que simula una plataforma de pedidos online, donde las personas pueden registrarse, iniciar sesion, elegir si su cuenta sera de cliente o tienda, explorar productos, gestionar un carrito de compras y publicar productos si tienen una tienda.

---

## 📌 Características principales

* Registro e inicio de sesion de usuarios
* Seleccion de tipo de cuenta: cliente o tienda
* Listado de tiendas
* Visualización de productos por tienda
* Carrito de compras (gestión de productos seleccionados)
* Relación entre tiendas y productos
* Publicacion de productos por parte de cuentas tipo tienda

---

## ⚠️ Aclaración sobre pagos

Este proyecto es una **demo educativa** y no procesa pagos reales.

* No se validan tarjetas de crédito/débito reales
* No se almacenan datos sensibles de pago
* Cualquier funcionalidad de "compra" o "pago" es simulada

El objetivo es representar el flujo completo de una aplicación de pedidos, sin involucrar transacciones reales.

---


## 💡 Casos de uso de ejemplo (¿Cómo funciona la aplicación?)

Para entender la dinámica de FoodRush en la práctica, a continuación se describen los principales flujos y recorridos de los distintos roles:

### 🛵 Caso 1: El Cliente realiza un pedido (Flujo de compra de punta a punta)
1. **Registro y exploración:** Juan se registra en la plataforma. Desde la Home explora categorías gastronómicas (Pizzas, Hamburguesas, Empanadas), busca tiendas en su zona o filtra por sus **tiendas favoritas** guardadas con un clic en el corazón.
2. **Selección de platos y regla mono-tienda:** Juan entra a *"Pizzería Central"* y agrega 2 porciones de Fugazzeta al carrito. Si intenta agregar una hamburguesa de otro local, el sistema le advierte que el carrito es mono-tienda para asegurar un único envío eficiente.
3. **Checkout seguro:** En el checkout, Juan selecciona su dirección de entrega guardada (o crea una nueva como *"Casa de mamá"*), elige método de pago simulado (Efectivo o Tarjeta) y agrega notas de entrega. Al confirmar, el stock se descuenta atómicamente y se congela el precio pactado.
4. **Seguimiento en vivo:** El pedido entra en estado `pending` (Pendiente). Juan recibe notificaciones en la campanita de navegación mientras la cocina lo acepta (`preparing`), lo despacha (`delivering`) y el repartidor lo entrega (`delivered`). Si Juan se arrepiente antes de que la cocina empiece a preparar, puede cancelarlo con reintegro automático de stock.
5. **Calificación:** Al recibir su comida, Juan califica la experiencia con estrellas (1 a 5), selecciona etiquetas dinámicas (*"Comida caliente"*, *"Envío rápido"*) y deja un comentario opcional para ayudar a la comunidad.

---

### 🍳 Caso 2: El Comerciante gestiona su local (Catálogo, Menú y Cocina)
1. **Onboarding express:** Sofía tiene una cuenta y decide registrar su negocio desde *"Abrir Tienda"*. Completa el nombre de su local, descripción e imagen. El sistema promueve automáticamente su rol a `vendedor`.
2. **Gestión del catálogo con stock híbrido:** Sofía publica sus platos. Puede elegir entre:
   - *Gastronomía estándar:* solo rige la disponibilidad activa/pausada (`is_available`).
   - *Control numérico estricto:* activa `track_stock` con unidades limitadas (ej. 15 postres del día). Al llegar a 0 unidades, el plato se pausa automáticamente.
3. **Soft-delete para proteger la historia:** Si Sofía decide retirar un plato que ya vendió semanas atrás, el sistema aplica un *borrado lógico* (`is_deleted = True`): desaparece de la carta pública pero permanece intacto en los pedidos históricos y estadísticas contables sin arrojar errores.
4. **Monitor de comanda y Cocina en vivo:** En la pestaña *"Cocina"* de su panel, Sofía ve ingresar los pedidos en tiempo real. 
   - Si todos los ingredientes están listos, presiona *"Aceptar y Preparar"* para comenzar a cocinar.
   - Si un producto quedó no disponible o sin stock, el sistema bloquea preventivamente la aceptación del pedido para no comprometer al local con algo que no puede entregar.
5. **Rechazo reactivo por falta de insumos:** Si se le acaba la muzzarella durante el turno, Sofía puede rechazar el pedido indicando *"Falta de ingrediente / Sin stock"* y seleccionar la pizza agotada. Automáticamente, el sistema cancela el pedido, devuelve el stock a los demás ítems y apaga la pizza en el menú público para que nadie más la pida por error.

---

### 🛡️ Caso 3: Moderación y Auditoría por parte del Administrador
1. **Panel de control centralizado:** El Administrador accede a `/admin/moderacion`, donde visualiza métricas de la plataforma, lista completa de comercios y auditoría de acciones en tiempo real.
2. **Suspensión preventiva de tiendas:** Si un local incumple las normas de calidad o higiene, el admin puede suspender la tienda con un solo clic. El sistema:
   - Oculta la tienda del catálogo público.
   - Cancela automáticamente todos sus pedidos en estado `pending` pendientes de preparación.
   - Reintegra el stock de los productos a los clientes.
   - Envía una notificación explicativa tanto al cliente como al dueño del comercio.
3. **Moderación de platos individuales:** Si un producto tiene un precio erróneo o imagen inapropiada, el admin puede pausarlo o eliminarlo preventivamente.
4. **Limpieza de carritos en curso:** Si un cliente tenía en su carrito un producto de una tienda que acaba de ser suspendida o un plato pausado, el ítem se remueve de inmediato y el cliente recibe un aviso en su campanita informándole lo sucedido antes de que intente pagarlo.

---

### ⚙️ Caso 4: Protección de integridad ante eventos inesperados
- **¿Qué pasa si un producto cambia de precio después de que compré?** Tu pedido no se altera; los precios unitarios y el total quedan congelados con un snapshot inmutable al momento del checkout.
- **¿Qué pasa si el comercio le cambia el nombre a una pizza o la elimina?** El cliente siempre verá en su historial el nombre original con el que compró el plato (`OrderItem.product_name`), evitando nombres vacíos o ítems huérfanos.
- **¿Qué pasa si intentan ingresar a rutas no autorizadas?** Las rutas están blindadas con `ProtectedRoute` y guards en el backend con permisos estrictos basados en roles (`cliente`, `vendedor`, `admin`).

---

## 🧱 Estructura de la base de datos

El sistema utiliza las siguientes tablas principales:

### 👤 users

Almacena los datos de los usuarios.

* id (PK)
* name
* email (unico)
* password
* phone
* role
* created_at

Restricciones recomendadas:

* `email` debe ser unico
* `role` puede ser `cliente`, `vendedor` o `admin`
* `cliente` debe ser el valor por defecto

---

### 🏪 stores

Representa las tiendas disponibles y su usuario propietario.

* id (PK)
* owner_id (FK -> users.id)
* name
* description
* image
* created_at

Restricciones recomendadas:

* `owner_id` debe ser unico para permitir una sola tienda por usuario

---

### 🍔 products

Productos asociados a cada tienda.

* id (PK)
* name
* description
* price
* is_available
* is_deleted (borrado logico para preservar historial de pedidos)
* stock
* track_stock (booleano para control numerico estricto vs gastronomia)
* image
* store_id (FK -> stores.id)
* created_at

Restricciones recomendadas:

* `price` debe ser mayor o igual a 0
* `stock` debe ser mayor o igual a 0
* `is_available` es un booleano que define si el producto esta activo o pausado

---

### 🛒 cart

Representa el carrito activo de cada usuario.

* id (PK)
* user_id (FK -> users.id)
* created_at

Restricciones recomendadas:

* un usuario debe tener un solo carrito activo
* regla mono-tienda: todos los items del carrito deben pertenecer a una misma tienda

---

### 📦 cart_items

Productos dentro del carrito.

* id (PK)
* cart_id (FK -> cart.id)
* product_id (FK -> products.id)
* quantity

Restricciones recomendadas:

* `quantity` debe ser mayor a 0
* no debe repetirse el mismo `product_id` dentro del mismo `cart_id`
* el producto debe estar disponible (`is_available = True`)

---

### 🧾 orders

Representa los pedidos confirmados por un usuario.

* id (PK)
* user_id (FK -> users.id)
* store_id (FK -> stores.id)
* total
* status
* created_at

Estados posibles:

* pending (Pendiente)
* preparing (En preparacion)
* delivering (En reparto)
* delivered (Entregado)
* cancelled (Cancelado)

---

### 🧺 order_items

Productos incluidos en cada pedido.

* id (PK)
* order_id (FK -> orders.id)
* product_id (FK -> products.id)
* product_name (snapshot inmutable del nombre al momento de compra)
* quantity
* unit_price

Restricciones recomendadas:

* `quantity` debe ser mayor a 0
* `unit_price` debe ser mayor o igual a 0
* el producto debe pertenecer a la tienda del pedido

---

### ❤️ favorite_stores

Tiendas gastronómicas guardadas como favoritas por los usuarios (Issue #42).

* id (PK)
* user_id (FK -> users.id)
* store_id (FK -> stores.id)
* created_at

Restricciones recomendadas:

* Unicidad compuesta: `(user_id, store_id)` (un usuario no puede duplicar la misma tienda en favoritos).

---

### ⭐ order_ratings

Calificaciones y reseñas de pedidos entregados (Issue #44).

* id (PK)
* order_id (OneToOne -> orders.id)
* rating (entero entre 1 y 5 estrellas)
* tags (JSON con motivos seleccionados)
* comment (texto opcional de reseña, máx. 300 caracteres)
* created_at

Restricciones recomendadas:

* Sólo aplicable a órdenes en estado `delivered`.
* Unicidad: un pedido sólo puede ser calificado una única vez.

---

### 🔔 notifications

Notificaciones y alertas del sistema en tiempo real para clientes y comercios.

* id (PK)
* user_id (FK -> users.id)
* title
* message
* notification_type (`order_status`, `order_cancelled`, `product_unavailable`, `store_moderation`, `product_moderation`, `cart_update`, `system`)
* is_read (booleano de lectura)
* link (ruta interna hacia pedidos, panel o carrito)
* created_at

---

## 🔗 Relaciones

* Una tienda tiene muchos productos
* Un producto pertenece a una tienda
* Un usuario puede registrarse como `cliente`, `vendedor` o `admin`
* Una tienda pertenece a un unico usuario propietario
* Un usuario tiene un carrito activo (asociado a una tienda a la vez)
* Un carrito tiene muchos items
* Cada item del carrito corresponde a un producto
* Un pedido pertenece a un usuario y a una unica tienda (`store`)
* Un pedido tiene muchos items
* Cada item del pedido corresponde a un producto

---

## ⚙️ Tecnologías utilizadas

### Backend

* Python
* Django
* Django REST Framework
* Django REST Framework SimpleJWT (autenticación JWT)
* Pillow (procesamiento y validación de imágenes)
* python-decouple (variables de entorno)

### Frontend

* React 19
* Vite 8 (dev server, HMR)
* Bootstrap 5 + bootstrap-icons (maquetado de la Home, TP6)
* Poppins (tipografia FoodRush)
* JavaScript (JSX) / HTML / CSS
* npm (Node.js)

### Base de datos

* PostgreSQL

---

## 🚀 Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

---

### 2. Crear entorno virtual

```bash
python -m venv .venv
source .venv/bin/activate   # Linux / Mac
.venv\Scripts\activate      # Windows
```

---

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

---

### 4. Configurar la base de datos

La configuracion de la base y la `SECRET_KEY` se leen automaticamente desde un archivo `.env`. Se puede copiar `.env.example` como base y completar:

```plaintext
DJANGO_SECRET_KEY
DB_NAME
DB_USER
DB_PASSWORD
DB_HOST
DB_PORT
```

Ejemplo rapido:

```bash
copy .env.example .env
```

La base esta gestionada por Django mediante migraciones. Una vez creada la base de datos en PostgreSQL y configuradas las variables, ejecutar:

```bash
python manage.py makemigrations
python manage.py migrate
```

Como referencia, la estructura esperada de tablas es la siguiente:

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'cliente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT UNIQUE,
    name VARCHAR(100),
    description TEXT,
    image VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description TEXT,
    price DECIMAL(10,2),
    is_available BOOLEAN DEFAULT TRUE,
    stock INT DEFAULT 0,
    image VARCHAR(100),
    store_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT,
    product_id INT,
    quantity INT,
    FOREIGN KEY (cart_id) REFERENCES cart(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE (cart_id, product_id)
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    store_id INT,
    total DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT,
    unit_price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

### 5. Ejecutar el servidor

```bash
python manage.py runserver
```

---

### 6. Frontend (React + Vite)

El frontend vive en `frontend/` (hermano del backend, mismo repositorio) y se sirve con Vite en el puerto 3000:

```bash
cd frontend
npm install        # primera vez
npm run dev        # http://localhost:3000
npm run lint       # ESLint (0 errores, 0 warnings)
npm test           # Tests con Vitest (198 tests pasando)
npm run build      # Build para producción
```

Rutas client-side principales:
* `/`: Home con categorías, tiendas destacadas y selector de dirección.
* `/tiendas` o `/explorar`: Catálogo completo con buscador y filtros por categoría gastronómica.
* `/tiendas/:id`: Carta del comercio y modal de producto.
* `/carrito`: Carrito reactivo mono-tienda con control de cantidades.
* `/checkout`: Confirmación de pedido, dirección prellenada y simulación de pago.
* `/perfil`: Edición de datos personales y gestión de direcciones guardadas.
* `/pedidos`: Historial cronológico de órdenes, seguimiento de estado y calificación con estrellas.
* `/favoritos`: Colección de tiendas guardadas como favoritas por el usuario.
* `/panel-tienda`: Panel del vendedor (onboarding de comercio, gestión de catálogo/disponibilidad y monitor de cocina/despacho).
* `/admin/moderacion`: Panel de moderación y auditoría de comercios y productos para administradores.
* `/login` / `/register`: Autenticación y registro con JWT.

El bosquejo de diseno y arquitectura de componentes esta en `docs/diagrama.md`.

---

## 📡 Endpoints principales

```plaintext
### Autenticación

POST   /api/token/                     # Login (obtener JWT)
POST   /api/token/refresh/             # Renovar token
POST   /api/register/                  # Registro de usuario (default: cliente)
POST   /api/logout/                    # Cerrar sesión (blacklist token)

### Usuarios

GET    /api/profile/                   # Ver mi perfil
PATCH  /api/profile/                   # Editar mi perfil
GET    /api/users/
POST   /api/users/

### Tiendas y Productos

GET    /api/stores/                    # Listar comercios (soporta ?search=, ?ordering= y filtros)
POST   /api/stores/
GET    /api/stores/my-store/           # Obtener mi tienda (vendedor autenticado)
GET    /api/stores/?owner=<id>         # Filtrar tienda por propietario
POST   /api/stores/:id/toggle-favorite/ # Alternar favorito del usuario autenticado (Issue #42)
GET    /api/stores/favorites/          # Listar tiendas favoritas del usuario autenticado
GET    /api/products/
POST   /api/products/                  # Solo ADMIN o VENDEDOR
PATCH  /api/products/:id/              # Editar producto / disponibilidad (is_available)
DELETE /api/products/:id/              # Eliminar producto de la tienda

### Carrito

GET    /api/carts/
POST   /api/carts/
GET    /api/cart-items/
POST   /api/cart-items/

### Pedidos

GET    /api/orders/
GET    /api/orders/?store=<id>         # Filtrar pedidos por tienda (para monitor de cocina)
POST   /api/orders/
PATCH  /api/orders/:id/                # Actualizar estado de despacho (tienda/admin)
POST   /api/orders/:id/rate/           # Calificar pedido entregado con 1-5 estrellas y tags (Issue #44)
GET    /api/order-items/
POST   /api/order-items/

### Notificaciones

GET    /api/notifications/             # Listar notificaciones del usuario autenticado
POST   /api/notifications/:id/read/    # Marcar una notificación como leída
POST   /api/notifications/mark-all-read/ # Marcar todas como leídas

### Documentación

GET    /api/schema/
GET    /api/docs/
```

Nota:
* `POST /api/carts/` reutiliza el carrito existente del usuario si ya tiene uno creado.
* Para el detalle exhaustivo de la matriz de permisos y transiciones de estado, consultar [`docs/roles_y_permisos.md`](docs/roles_y_permisos.md).

La API actual aplica las siguientes restricciones:
* autenticacion via JWT (token Bearer) requerida para la mayoria de endpoints
* los recursos personales (`users`, `carts`, `cart-items`, `orders`, `order-items`) requieren autenticacion para modificar datos
* solo el propietario puede modificar sus propios recursos
* la creacion de productos esta restringida a ADMIN o VENDEDOR
* la lectura de productos y tiendas es publica
* cualquier usuario autenticado puede crear una tienda (se promueve automaticamente a `vendedor`)
* **Regla Mono-tienda:** tanto el carrito como los pedidos están restringidos a productos de un único comercio.
* **Flujo de pedidos:** el vendedor gestiona el avance `pending` -> `preparing` -> `delivering` -> `delivered`, mientras que el cliente puede cancelar pedidos en estado `pending`.

Ejemplo de registro:

```json
{
  "name": "Juan Perez",
  "email": "juan@email.com",
  "password": "123456",
  "phone": "1122334455"
}
```

El registro siempre crea el usuario con rol `cliente`. Para ser `vendedor`, el usuario crea su tienda y el sistema lo promueve automaticamente. Solo los usuarios `vendedor` o `admin` pueden publicar productos.

Ejemplo de login (obtener JWT):

```json
POST /api/token/
{
  "email": "juan@email.com",
  "password": "123456"
}
```

Respuesta esperada:

```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "juan@email.com",
    "name": "Juan Perez",
    "role": "cliente"
  }
}
```

Usar el token en las peticiones siguientes:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 🔍 ¿Por qué JWT en lugar de sesiones tradicionales?

En una aplicacion con sesiones tradicionales, el servidor almacena el estado de cada usuario (memoria o base de datos) y lo consulta en cada peticion. JWT elimina esa necesidad: el servidor firma un token y se lo entrega al cliente, quien lo reenvia en cada request. El servidor solo valida la firma sin consultar ningun almacenamiento central.

Principales ventajas que llevaron a elegir JWT en este proyecto:

* **Escalabilidad:** cualquier servidor del cluster puede validar un token sin compartir sesiones. Esto facilita agregar mas instancias si la aplicacion crece.
* **Rendimiento:** se evita una consulta a base de datos o Redis por cada peticion para verificar la sesion.
* **Desacoplamiento:** como no se usan cookies, el frontend (React, mobile, etc.) puede estar en un dominio distinto al backend sin problemas de CORS entre dominios.
* **Flexibilidad:** el token puede incluir informacion como el `role` del usuario, reduciendo consultas extras a la base de datos.
* **Estandar moderno:** JWT es el mecanismo de autenticacion mas adoptado en APIs REST y aplicaciones SPA, con herramientas maduras en Django (`djangorestframework-simplejwt`).

---

## 📌 Estado del proyecto

> 📄 El detalle completo del estado del proyecto y cada TP está en [`ESTADO_ACTUAL.md`](ESTADO_ACTUAL.md).

* TP1 a TP3: backend (API Django + JWT) implementado y aprobado (mergeados a `main`)
* TP4: validación de API, matriz de pruebas, tests y reglas de negocio completado y mergeado a `main` (PR #10)
* TP5: frontend React con Vite (`frontend/`, puerto 3000) mergeado a `main` (PR #6)
* TP6: maquetado de la Home con Bootstrap mergeado a `main` (PR #8)
* TP7: autenticación y rutas con React Router y mock data mergeado a `main` (PR #9)
* TP8: conexión de frontend React con backend Django REST (JWT, login, registro, logout y perfil) completado y mergeado a `main` (PR #11)
* TP9: Vistas Completas y Funcionalidad Full-Stack en desarrollo activo en rama `TP9` (PR #37). Milestone 1 (Catálogo Real y Carrito), Milestone 2 (Checkout Transaccional y Gestión de Pedidos) y Milestone 3 (Panel de Vendedor, Menú y Cocina) 100% completados con TDD y cerrados en GitHub. 198 tests frontend y 97 tests backend pasando al 100%.

---

## 👨‍💻 Autor

Agustín Valdebenito
Estudiante de Ingeniería Informática

---

## 📄 Licencia

Este proyecto es de uso educativo.
