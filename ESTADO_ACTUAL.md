# Estado Actual Del Proyecto

## Resumen

El proyecto backend esta iniciado con Django y Django REST Framework.
La base del TP1 ya fue puesta en marcha y el TP2 quedo implementado en su estructura principal: modelos, migraciones, admin, serializers, vistas CRUD, rutas de API y Swagger.

## Estado actual

* Repositorio Git creado y en uso
* Proyecto Django creado en la carpeta `FoodRush/`
* Aplicaciones `core` y `users` creadas
* Dependencias principales instaladas: `Django`, `djangorestframework`, `django-cors-headers`, `drf-spectacular`, `psycopg[binary]`
* Configuracion de `INSTALLED_APPS` realizada
* Configuracion de CORS agregada
* Base de datos definida para trabajar con PostgreSQL
* Configuracion sensible movida a variables de entorno (`DJANGO_SECRET_KEY`, `DB_*`)
* Modelo de usuario custom configurado con `AUTH_USER_MODEL = 'users.Usuario'`
* Migraciones creadas y aplicadas correctamente
* Modelos registrados en Django admin
* Serializers creados para `users` y `core`
* API CRUD inicial creada con DRF `ModelViewSet`
* Rutas `/api/` registradas para usuarios, tiendas, productos, carritos y pedidos
* Swagger disponible en `/api/docs/`
* El endpoint de carritos reutiliza el carrito existente de un usuario para respetar la relacion `OneToOne`
* README del proyecto actualizado con la estructura y endpoints actuales
* Servidor local, panel admin y superusuario ya fueron probados por el equipo

## Modelos implementados

Actualmente existen estos modelos:

* `users.Usuario`
* `core.Store`
* `core.Product`
* `core.Cart`
* `core.CartItem`
* `core.Order`
* `core.OrderItem`

## Modelado definido hasta ahora

Decisiones tomadas en el modelo:

* un usuario puede registrarse como `client` o `store`
* `client` es el rol por defecto
* un usuario con rol `store` podra tener una sola tienda
* la tienda podra publicar productos
* un usuario tiene un solo carrito activo
* un carrito no puede repetir el mismo producto
* un pedido tiene multiples items y guarda `unit_price`

## Pendiente de implementacion

Estas partes ya estan pensadas o documentadas, pero todavia no estan completas en codigo:

* endpoints de autenticacion
* autenticacion con JWT
* permisos por rol (`client` y `store`)
* asociar acciones al usuario autenticado
* validaciones de negocio en vistas y serializers
* pruebas automaticas
* filtros y consultas mas especificas en la API
* historial de compras y flujo real de confirmacion de pedidos

## Limpieza realizada

Para dejar el repositorio mas prolijo:

* se agrego `.gitignore` en la raiz
* se agrego `.env.example` como referencia para la configuracion local
* se elimino el archivo `umllmkey` del repositorio
* se eliminaron archivos `__pycache__` versionados
* se elimino `db.sqlite3` del repositorio
* se corrigio el modelo `Usuario` y se paso a custom user con `AbstractUser`
* se actualizo `requirements.txt` con el driver de PostgreSQL

## Estado del TP

* TP1: base del proyecto completada y validada por el equipo
* TP2: implementado en su parte principal

Puntos cubiertos del TP2:

* PostgreSQL conectado
* modelos principales definidos
* migraciones creadas y aplicadas
* admin configurado
* serializers creados
* vistas CRUD iniciales funcionando a nivel de proyecto
* rutas de API registradas
* Swagger integrado

## Observaciones

* La API actual es CRUD basico y todavia no tiene autenticacion ni restricciones por permisos.
* Ya no quedan credenciales de base de datos hardcodeadas en `settings.py`.
* El proximo paso natural del proyecto es JWT, permisos por rol y proteccion de endpoints.
* Si la clave eliminada de `umllmkey` fue usada fuera del entorno local, conviene regenerarla o revocarla por seguridad.
