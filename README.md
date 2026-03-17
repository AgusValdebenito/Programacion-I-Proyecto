# Programacion-I-Proyecto

# 🍔 App de Pedidos (Tipo PedidosYa)

Aplicación web full-stack que simula una plataforma de pedidos online, donde los usuarios pueden registrarse, iniciar sesión, ver tiendas, explorar productos y gestionar un carrito de compras.

---

## 📌 Características principales

* Registro e inicio de sesión de usuarios
* Listado de tiendas
* Visualización de productos por tienda
* Carrito de compras (gestión de productos seleccionados)
* Relación entre tiendas y productos

---

## ⚠️ Aclaración sobre pagos

Este proyecto es una **demo educativa** y no procesa pagos reales.

* No se validan tarjetas de crédito/débito reales
* No se almacenan datos sensibles de pago
* Cualquier funcionalidad de "compra" o "pago" es simulada

El objetivo es representar el flujo completo de una aplicación de pedidos, sin involucrar transacciones reales.

---

## 🧱 Estructura de la base de datos

El sistema utiliza las siguientes tablas:

### 👤 users

Almacena los datos de los usuarios.

* id (PK)
* name
* email (único)
* password
* created_at

---

### 🏪 stores

Representa las tiendas disponibles.

* id (PK)
* name
* description
* created_at

---

### 🍔 products

Productos asociados a cada tienda.

* id (PK)
* name
* price
* store_id (FK → stores.id)

---

### 🛒 cart

Representa el carrito de cada usuario.

* id (PK)
* user_id (FK → users.id)

---

### 📦 cart_items

Productos dentro del carrito.

* id (PK)
* cart_id (FK → cart.id)
* product_id (FK → products.id)
* quantity

---

## 🔗 Relaciones

* Una tienda tiene muchos productos
* Un producto pertenece a una tienda
* Un usuario tiene un carrito
* Un carrito tiene muchos items
* Cada item corresponde a un producto

---

## ⚙️ Tecnologías utilizadas

### Backend

* Python
* Flask

### Frontend

* HTML
* CSS
* JavaScript

### Base de datos

* MySQL / MariaDB

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

Ejecutar las siguientes sentencias SQL:

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    price DECIMAL(10,2),
    store_id INT,
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT,
    product_id INT,
    quantity INT,
    FOREIGN KEY (cart_id) REFERENCES cart(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

### 5. Ejecutar el servidor

```bash
python app.py
```

---

## 📡 Endpoints principales

```plaintext
POST   /register
POST   /login

GET    /stores
GET    /stores/:id/products

GET    /cart
POST   /cart/add
POST   /cart/remove
```

---

## 📌 Estado del proyecto

🟡 En desarrollo

Funcionalidades futuras:

* Confirmación de pedidos (orders)
* Historial de compras
* Autenticación con JWT
* Panel para tiendas

---

## 👨‍💻 Autor

Agustín Valdebenito
Estudiante de Ingeniería Informática

---

## 📄 Licencia

Este proyecto es de uso educativo.
