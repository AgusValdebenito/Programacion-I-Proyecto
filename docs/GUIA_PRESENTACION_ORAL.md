# 🎤 Guía de Presentación Oral y Machete de Defensa — FoodRush

> **Documento preparado para Agustín Valdebenito**  
> **Cátedra:** Programación I — Universidad de Mendoza (Sede San Rafael)  
> **Profesor:** Nicolás Carballo  
> **Año:** 2026  

---

## 🧭 Índice Rápido
1. [La idea en 30 segundos (El Pitch)](#1-la-idea-en-30-segundos-el-pitch)
2. [Mapa del Proyecto: Dónde está cada cosa](#2-mapa-del-proyecto-dónde-está-cada-cosa)
3. [Cómo funciona por dentro (5 conceptos clave)](#3-cómo-funciona-por-dentro-5-conceptos-clave)
4. [Guion de Presentación en Vivo (Paso a paso para la demo)](#4-guion-de-presentación-en-vivo-paso-a-paso-para-la-demo)
5. [Machete de Preguntas Difíciles del Profesor](#5-machete-de-preguntas-difíciles-del-profesor)
6. [Hoja Resumen para Imprimir (Cheat Sheet)](#6-hoja-resumen-para-imprimir-cheat-sheet)

---

## 1. La idea en 30 segundos (El Pitch)

> **Qué decir al empezar:**  
> *"Buenas tardes profesor. Mi proyecto se llama **FoodRush** y es una plataforma web completa de pedidos y delivery multi-tienda, inspirada en aplicaciones reales como PedidosYa o Rappi.*  
> *Está construida con una arquitectura profesional desacoplada: un backend en **Django REST Framework**, una aplicación web interactiva en **React con Vite**, y un despliegue 100% en la nube con **Vercel, Render, PostgreSQL y Cloudinary**.*  
> *La plataforma contempla tres actores reales: el **Cliente** que compra y califica, el **Comerciante** que cocina y gestiona su menú, y el **Administrador** que modera y audita el sistema."*

---

## 2. Mapa del Proyecto: Dónde está cada cosa

Si el profesor te pide: *"Mostrame dónde tenés tal archivo en el código"*, acá tenés la ubicación exacta explicada simple:

```text
Programacion-I-Proyecto/
├── FoodRush/            --> Configuración central de Django (settings.py, urls.py).
├── users/               --> Todo lo de usuarios, registro, login y roles.
├── core/                --> El corazón del negocio (tiendas, productos, pedidos, carritos).
├── frontend/            --> La aplicación web del usuario en React + Vite.
├── media/               --> Catálogo local de fotos (respaldo si se corre sin internet).
└── docs/                --> Informe final, diagramas y guías de entrega.
```

### En el Backend (Django REST Framework):
* **`FoodRush/settings.py`**: El cerebro de configuración. Lee variables de entorno con `python-decouple`, configura CORS para que React pueda comunicarse, conecta PostgreSQL y Cloudinary.
* **`users/models.py`**: Define nuestro usuario personalizado (`Usuario`), que hereda de `AbstractUser` y tiene roles: `cliente`, `vendedor` y `admin`.
* **`core/models.py`**: Las entidades del sistema:
  * `Store` (Tiendas): logo, descripción, dueño.
  * `Product` (Platos/Artículos): precio, stock, disponibilidad.
  * `Cart` y `CartItem` (Carritos mono-tienda).
  * `Order` y `OrderItem` (Historial y estados del pedido).
  * `Review` (Calificaciones con estrellas y etiquetas).
* **`core/views.py`**: Las APIs que alimentan al frontend (Endpoints de tiendas, productos, checkout, pedidos y moderación).
* **`core/management/commands/`**: Comandos automatizados (`populate_extended_catalog` que carga las 50 tiendas reales y `upload_media_to_cloudinary` que sube las fotos a la nube).

### En el Frontend (React + Vite):
* **`frontend/src/views/`**: Las pantallas completas que ve el usuario:
  * `Home.jsx`: Portada con buscador, categorías y tiendas destacadas.
  * `Stores.jsx`: Directorio de locales con filtros y ordenamiento.
  * `StoreDetail.jsx`: Menú de cada tienda con sus productos y agregar al carrito.
  * `Cart.jsx` y `Checkout.jsx`: Gestión de compra, dirección y método de pago.
  * `PanelTienda.jsx`: La vista de cocina del comerciante para gestionar pedidos y pausar productos.
  * `ModerationPanel.jsx`: Panel del administrador para suspender locales o ver métricas.
  * `Profile.jsx`: Historial de pedidos y direcciones del cliente.
* **`frontend/src/services/`**: Los archivos que hacen las peticiones HTTP con `fetch`:
  * `api.js`: El cliente base que inyecta automáticamente el token JWT en cada llamada.
  * `storeService.js`, `productService.js`, `orderService.js`, etc.
* **`frontend/src/contexts/`**: El estado global (la memoria de la app):
  * `AuthContext.jsx`: Guarda quién está conectado y qué rol tiene.
  * `CartContext.jsx`: Maneja el carrito en tiempo real.
  * `FavoritesContext.jsx`: Guarda las tiendas que le gustan al usuario.

---

## 3. Cómo funciona por dentro (5 conceptos clave)

Estos son los 5 puntos técnicos que demuestran solidez y buenas prácticas:

1. **Autenticación con JWT (JSON Web Tokens):**
   * El cliente hace login con usuario y contraseña.
   * El backend valida y le entrega dos credenciales cifradas: un `access_token` (de corta duración) y un `refresh_token`.
   * En cada petición posterior, React envía el token en la cabecera `Authorization: Bearer <token>`. El backend sabe quién es el usuario sin necesidad de consultar la sesión en disco.

2. **Regla de Negocio "Mono-Tienda":**
   * Para evitar problemas logísticos reales (no podés mandarle a una misma moto a retirar una pizza a 5 km y un sushi a 10 km al mismo tiempo), el carrito solo permite artículos de una sola tienda a la vez.
   * Si el cliente intenta agregar un producto de otra tienda, el sistema salta con un aviso inteligente: le pregunta si prefiere vaciar el carrito actual para iniciar uno nuevo o mantener lo que ya tenía.

3. **Atomicidad y Manejo de Concurrencia en Checkout (`transaction.atomic()`):**
   * Cuando se confirma un pedido, deben ocurrir tres cosas: congelar el precio unitario del momento, descontar el stock de cada producto y vaciar el carrito.
   * Si una sola falla (por ejemplo, alguien compró el último alfajor un milisegundo antes), la transacción se revierte al 100% (*Rollback*). Nunca queda un pedido inconsistente.

4. **Ciclo de Vida de los Estados del Pedido:**
   * `pending` (Pendiente): El cliente lo acaba de pagar.
   * `preparing` (En preparación): El comerciante lo aceptó en cocina.
   * `delivering` (En camino): Salió el repartidor.
   * `delivered` (Entregado): Llegó al cliente. Se habilita la calificación con estrellas y etiquetas dinámicas.
   * `cancelled` (Cancelado): Si se cancela antes de prepararse, el stock se devuelve automáticamente a la tienda.

5. **Arquitectura Cloud y Almacenamiento Multimedia (TP10):**
   * **Vercel**: Sirve la aplicación React (Single Page Application) desde servidores perimetrales (CDN), haciendo que cargue al instante.
   * **Render**: Aloja la API Django y la base de datos PostgreSQL.
   * **Cloudinary**: CDN externa especializada en imágenes. Esto evita sobrecargar la memoria del servidor de Render y permite que las fotos carguen comprimidas y optimizadas para móviles o escritorio.

---

## 4. Guion de Presentación en Vivo (Paso a paso para la demo)

Seguí este recorrido paso a paso durante tu defensa. Demuestra todo el proyecto en solo 5 minutos:

### Paso 1: Introducción y Exploración (1 minuto)
* Abrí el navegador en la web de producción: [https://foodrush-delivery.vercel.app/](https://foodrush-delivery.vercel.app/)
* **Qué decir:** *"La aplicación carga inmediatamente desde Vercel. En la Home tenemos las categorías principales (Restaurantes, Cafeterías, Helados, Súper y Kioscos) y un carrusel de tiendas destacadas con insignias de estado (Abierto o Cerrado)."*
* Mostrá el buscador en vivo: escribí `"Empanadas"` y mostrá cómo filtra al instante la tienda **Empanadas Criollas Don Lorenzo**.

### Paso 2: El Flujo del Cliente (1.5 minutos)
* Iniciá sesión con la cuenta de prueba de cliente:
  * **Email:** `cliente@foodrush.com` | **Contraseña:** `FoodRush2026!`
* Hacé clic en la tienda **Empanadas Criollas Don Lorenzo**.
* **Qué decir:** *"Acá vemos el menú real de la tienda. Cada producto tiene su foto real horneada, precio, descripción y disponibilidad. Voy a agregar una docena de empanadas al carrito."*
* Mostrá el icono del carrito en el Navbar: sube el contador a `1`.
* Entrá al Carrito y dale a **Continuar compra** (Checkout).
* Elegí una dirección guardada (ej. *"Casa"*), método de pago (*"Efectivo"*), y dale a **Confirmar Pedido**.
* **Qué decir:** *"En este momento el backend ejecutó una transacción atómica: congeló los precios, descontó el stock y dejó el pedido en estado 'Pendiente' con número de seguimiento."*

### Paso 3: El Flujo del Comerciante / Cocina (1.5 minutos)
* Abrí una **ventana de incógnito** o cerrá sesión e ingresá con el vendedor de Don Lorenzo:
  * **Email:** `empanadas_lorenzo@foodrush.com` | **Contraseña:** `FoodRush2026!`
* Hacé clic en el enlace **"Mi Tienda"** en la barra superior.
* **Qué decir:** *"Este es el Panel de Control del comerciante. En la pestaña 'Menú' puede cambiar precios, agregar nuevos platos o pausar productos agotados. Y en la pestaña 'Pedidos' ve en vivo el pedido que acabamos de hacer como cliente."*
* Hacé clic en el botón **Aceptar y Preparar** (`preparing`) y luego en **Despachar** (`delivering`).
* Marcá el pedido como **Entregado** (`delivered`).

### Paso 4: Notificaciones y Calificación (1 minuto)
* Volvé a la pestaña del cliente (o iniciá sesión de nuevo como cliente).
* Mostrá la **campanita de notificaciones** arriba a la derecha: va a tener el punto azul avisando que el pedido cambió de estado.
* Entrá a tu **Perfil** (`/perfil`), andá a **Mis Pedidos** y mostrá que aparece el botón **"Calificar"**.
* Abrí el modal de calificación, seleccioná **5 estrellas**, tildá etiquetas positivas (*"Comida caliente"*, *"Llegó a tiempo"*) y guardá.

### Paso 5: El Backend y la Documentación Swagger (30 segundos)
* Para cerrar con broche de oro, abrí la pestaña de Swagger:
  [https://programacion-i-proyecto.onrender.com/api/docs/](https://programacion-i-proyecto.onrender.com/api/docs/)
* **Qué decir:** *"Toda la API está documentada bajo el estándar OpenAPI 3.0 con Swagger UI. Hay endpoints para autenticación JWT, tiendas, productos, favoritos, carritos, checkout, pedidos y moderación administrativa. Además, el proyecto cuenta con más de 90 tests automatizados en Django y más de 200 tests unitarios en React, asegurando una cobertura robusta bajo TDD."*

---

## 5. Machete de Preguntas Difíciles del Profesor

Si el profesor te hace preguntas conceptuales para evaluar si realmente lo hiciste vos, respondé con estas frases:

#### P1: ¿Por qué usaron JWT en lugar de sesiones con cookies tradicionales de Django?
> **Respuesta:**  
> *"Porque separamos el Frontend del Backend. Al ser una Single Page Application alojada en Vercel y un servidor API en Render con dominios diferentes, las sesiones tradicionales dependen de cookies vinculadas al mismo servidor y obligan a almacenar estado en el backend. Con JWT, la autenticación es completamente stateless: el token viaja en la cabecera `Authorization`, el backend solo verifica su firma criptográfica y esto escala mucho mejor en la nube."*

#### P2: ¿Por qué las fotos están en Cloudinary y no guardadas directamente en el servidor de Render?
> **Respuesta:**  
> *"Porque los servidores modernos en la nube como Render o Heroku tienen sistemas de archivos efímeros. Si el servidor se reinicia o se despliega una nueva versión, todo archivo guardado en el disco local se borra. Además, Cloudinary actúa como un Content Delivery Network (CDN), lo que significa que comprime las imágenes a formatos modernos como WebP y las entrega desde el servidor geográficamente más cercano al usuario."*

#### P3: ¿Cómo asegurás que dos usuarios no compren el mismo producto si queda 1 solo en stock?
> **Respuesta:**  
> *"Lo manejamos en el endpoint de Checkout mediante atomicidad en la base de datos con `transaction.atomic()`. Al momento de crear el pedido, se valida el stock actual y se resta de forma aislada. Si el stock no alcanza, se lanza una excepción de validación que dispara un Rollback completo, devolviendo un error 400 amigable al usuario indicándole que el producto se agotó."*

#### P4: ¿Cómo se comunican el frontend y el backend evitando problemas de CORS?
> **Respuesta:**  
> *"En Django configuramos el paquete `django-cors-headers` agregando el dominio de Vercel (`https://foodrush-delivery.vercel.app`) a la lista blanca `CORS_ALLOWED_ORIGINS`. Y en el frontend centralizamos todas las peticiones en un cliente de servicio (`api.js`) que antepone la URL base y adjunta el token JWT en cada solicitud."*

#### P5: ¿Cómo garantizaste que el proyecto no se rompiera al agregar nuevas funciones?
> **Respuesta:**  
> *"Aplicamos desarrollo guiado por pruebas (TDD) y metodologías ágiles divididas en Milestones. En el backend implementamos 93 tests con `APITestCase` para validar permisos, roles, transacciones y serializers. En el frontend desarrollamos 206 tests con Vitest y React Testing Library que simulan clics reales, renderizado de componentes y navegación. Todo está integrado en un pipeline de integración continua con GitHub Actions."*

---

## 6. Hoja Resumen para Imprimir (Cheat Sheet)

*(Podés imprimir esta página o tenerla en una hoja al lado de la computadora).*

| Concepto | Detalle para recordar |
| :--- | :--- |
| **Nombre del Proyecto** | **FoodRush** — Plataforma Full-Stack de Delivery Gastronómico |
| **Alumno** | Agustín Valdebenito |
| **Cátedra** | Programación I — Prof. Nicolás Carballo |
| **Frontend en vivo** | `https://foodrush-delivery.vercel.app/` |
| **Backend API en vivo** | `https://programacion-i-proyecto.onrender.com/` |
| **Documentación Swagger** | `https://programacion-i-proyecto.onrender.com/api/docs/` |

### 🔑 Cuentas de Acceso Rápido para la Demo:
* **Cliente:** `cliente@foodrush.com` / `FoodRush2026!`  
  *(Para explorar, comprar, probar el carrito, checkout y calificar).*
* **Vendedor (Empanadas Don Lorenzo):** `empanadas_lorenzo@foodrush.com` / `FoodRush2026!`  
  *(Para abrir el Panel de Tienda, recibir pedidos en vivo y cambiar estados).*
* **Administrador:** `admin@foodrush.com` / `FoodRush2026!`  
  *(Para ingresar al Panel de Moderación `/moderacion` y panel Django admin `/admin/`).*

### 📌 Los 4 Pilares Técnicos a Mencionar:
1. **Frontend Desacoplado:** React 19 + Vite + Bootstrap 5 + Context API.
2. **Backend RESTful:** Python 3.12 + Django 5 + Django REST Framework + JWT.
3. **Persistencia y Nube:** PostgreSQL en Render + Almacenamiento CDN en Cloudinary.
4. **Calidad y Testing:** 93 tests en Backend + 206 tests en Frontend + CI en GitHub Actions.
