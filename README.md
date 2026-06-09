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
* store_id (FK -> stores.id)
* created_at

Restricciones recomendadas:

* `price` debe ser mayor o igual a 0

---

### 🛒 cart

Representa el carrito activo de cada usuario.

* id (PK)
* user_id (FK -> users.id)
* created_at

Restricciones recomendadas:

* un usuario debe tener un solo carrito activo

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

---

### 🧾 orders

Representa los pedidos confirmados por un usuario.

* id (PK)
* user_id (FK -> users.id)
* total
* status
* created_at

Estados posibles sugeridos:

* pending
* preparing
* delivering
* delivered
* cancelled

---

### 🧺 order_items

Productos incluidos en cada pedido.

* id (PK)
* order_id (FK -> orders.id)
* product_id (FK -> products.id)
* quantity
* unit_price

Restricciones recomendadas:

* `quantity` debe ser mayor a 0
* `unit_price` debe ser mayor o igual a 0

---

## 🔗 Relaciones

* Una tienda tiene muchos productos
* Un producto pertenece a una tienda
* Un usuario puede registrarse como `cliente`, `vendedor` o `admin`
* Una tienda pertenece a un unico usuario propietario
* Un usuario tiene un carrito activo
* Un carrito tiene muchos items
* Cada item del carrito corresponde a un producto
* Un usuario puede tener muchos pedidos
* Un pedido tiene muchos items
* Cada item del pedido corresponde a un producto

---

## ⚙️ Tecnologías utilizadas

### Backend

* Python
* Django
* Django REST Framework
* Django REST Framework SimpleJWT (autenticación JWT)

### Frontend

* HTML
* CSS
* JavaScript

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
python -m venv venv
source venv/bin/activate   # Linux / Mac
venv\Scripts\activate      # Windows
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description TEXT,
    price DECIMAL(10,2),
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
    total DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
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

GET    /api/stores/
POST   /api/stores/
GET    /api/products/
POST   /api/products/                  # Solo ADMIN o VENDEDOR

### Carrito

GET    /api/carts/
POST   /api/carts/
GET    /api/cart-items/
POST   /api/cart-items/

### Pedidos

GET    /api/orders/
POST   /api/orders/
GET    /api/order-items/
POST   /api/order-items/

### Documentación

GET    /api/schema/
GET    /api/docs/
```

Nota:
`POST /api/carts/` reutiliza el carrito existente del usuario si ya tiene uno creado.

La API actual aplica las siguientes restricciones:
* autenticacion via JWT (token Bearer) requerida para la mayoria de endpoints
* los recursos personales (`users`, `carts`, `cart-items`, `orders`, `order-items`) requieren autenticacion para modificar datos
* solo el propietario puede modificar sus propios recursos
* la creacion de productos esta restringida a ADMIN o VENDEDOR
* la lectura de productos es publica
* cualquier usuario autenticado puede crear una tienda (se promueve automaticamente a `vendedor`)

Ejemplo de registro:

```json
{
  "name": "Juan Perez",
  "email": "juan@email.com",
  "password": "123456",
  "phone": "1122334455",
  "role": "cliente"
}
```

Si el usuario elige `role = "vendedor"`, luego podra crear su tienda y publicar productos.

Ejemplo de login (obtener JWT):

```json
POST /api/token/
{
  "username": "juanperez",
  "password": "123456"
}
// Respuesta:
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
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

---

## 👨‍💻 Autor

Agustín Valdebenito
Estudiante de Ingeniería Informática

---

## 📄 Licencia

Este proyecto es de uso educativo.
