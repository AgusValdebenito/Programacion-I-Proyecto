# Estado Actual Del Proyecto

## Resumen

El proyecto backend esta iniciado con Django y Django REST Framework.
La base del TP1 ya fue puesta en marcha y el proyecto se encuentra listo para seguir con el modelado de datos y la implementacion de endpoints.

## Estado actual

* Repositorio Git creado y en uso
* Proyecto Django creado en la carpeta `FoodRush/`
* Aplicaciones `core` y `users` creadas
* Dependencias principales instaladas:
  * `Django`
  * `djangorestframework`
  * `django-cors-headers`
  * `drf-spectacular`
* Configuracion inicial de `INSTALLED_APPS` realizada
* Configuracion inicial de CORS agregada
* Base de datos definida para trabajar con PostgreSQL
* Servidor local probado por el equipo
* Panel de administracion probado por el equipo
* Superusuario creado previamente
* README del proyecto creado y actualizado con la estructura general y decisiones actuales

## Modelado definido hasta ahora

Se acordaron estas entidades principales para continuar el desarrollo:

* `users`
* `stores`
* `products`
* `cart`
* `cart_items`
* `orders`
* `order_items`

Tambien se definio que:

* un usuario puede registrarse como `customer` o `store`
* `customer` sera el rol por defecto
* un usuario con rol `store` podra tener una sola tienda
* la tienda podra publicar productos

## Pendiente de implementacion

Estas partes ya estan pensadas o documentadas, pero todavia no estan completas en codigo:

* modelos completos de `core`
* ampliacion del modelo de usuario con `role`
* endpoints de autenticacion
* endpoints de tiendas y productos
* endpoints de carrito
* endpoints de pedidos
* serializers, vistas y rutas de la API
* pruebas automaticas

## Limpieza realizada

Para dejar el repositorio mas prolijo:

* se agrego `.gitignore` en la raiz
* se elimino el archivo `umllmkey` del repositorio
* se eliminaron archivos `__pycache__` versionados
* se corrigio el modelo `Usuario` para usar `__str__`

## Observaciones

* El README mezcla estado actual del proyecto con estructura objetivo de las siguientes etapas. Eso esta bien mientras el equipo lo use como documento de referencia y no como lista de funcionalidades ya implementadas.
* Si la clave eliminada de `umllmkey` fue usada fuera del entorno local, conviene regenerarla o revocarla por seguridad.
