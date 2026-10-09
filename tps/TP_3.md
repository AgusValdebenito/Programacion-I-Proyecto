# Trabajo Práctico N°3

## Gestión de Identidad, Roles y Seguridad con JWT

### 🎯 Objetivo

Implementar un sistema de autenticación y autorización robusto. El foco no es solo "crear un usuario", sino diseñar cómo el sistema identifica quién es el usuario (**Autenticación**) y qué tiene permitido hacer (**Autorización**) mediante el uso de Roles y Tokens JWT.

---

### 🧠 Fundamento Técnico: ¿Por qué hacemos esto?

#### 1\. Modelos de Usuario Personalizados (`AbstractUser`)

En Django, el modelo de usuario por defecto es limitado. Al heredar de `AbstractUser`, tomamos el control total de la identidad. Esto nos permite agregar campos como `rol`, `telefono` o `direccion` sin romper la compatibilidad con el sistema de autenticación de Django.

#### 2\. Autenticación Stateless con JWT (JSON Web Tokens)

A diferencia de las sesiones basadas en cookies (donde el servidor guarda la sesión en memoria/BD), JWT es **stateless**. El servidor firma un token y se lo entrega al cliente. El cliente lo envía en cada petición (`Authorization: Bearer <token>`).

- **Ventaja**: Escalabilidad. El servidor no necesita recordar quién está logueado; solo necesita validar la firma del token.

#### 3\. Control de Acceso Basado en Roles (RBAC)

No todos los usuarios son iguales. Implementar RBAC (*Role-Based Access Control*) permite definir permisos granulares. Por ejemplo:

- **Admin**: Puede crear/editar productos y ver todos los pedidos.  
- **Cliente**: Solo puede gestionar su propio carrito y ver sus pedidos.  
- **Vendedor**: Puede actualizar el stock, pero no borrar productos.

---

### 🛠️ Actividades

#### Paso 1: Definición de la Identidad

1. Crear la app `users`.  
2. Implementar un modelo de usuario que herede de `AbstractUser`.  
3. Agregar un campo `role` (usando `Choices` de Django) con las opciones: `ADMIN`, `CLIENTE`, `VENDEDOR`.  
4. Configurar `AUTH_USER_MODEL` en `settings.py`.

#### Paso 2: Implementación de Autenticación JWT

1. Instalar `djangorestframework-simplejwt`.  
2. Configurar `REST_FRAMEWORK` en `settings.py` para usar `JWTAuthentication` como clase predeterminada.  
3. Configurar las rutas de `TokenObtainPairView` (login) y `TokenRefreshView` (renovación de token).

#### Paso 3: Control de Acceso y Permisos

1. Crear permisos personalizados en DRF (`permissions.BasePermission`).  
2. Implementar una lógica donde:  
   - El acceso a la creación de productos esté restringido a `ADMIN` o `VENDEDOR`.  
   - La lectura de productos sea pública.  
   - La gestión del carrito sea exclusiva del `CLIENTE` autenticado.  
3. Aplicar estos permisos en las vistas del proyecto utilizando `permission_classes`.

#### Paso 4: Flujos de Usuario

1. Crear endpoints para:  
   - **Registro**: Permitir que un usuario cree su cuenta (por defecto como `CLIENTE`).  
   - **Perfil**: Endpoint para que el usuario vea sus propios datos.  
   - **Logout**: Explicar el concepto de "blacklist" de tokens.

---

### 📦 Entregables

1. **Código Fuente**: App `users` implementada y configurada. (PR)  
2. **Pruebas de Acceso**: Probar con postman:  
   - Acceso exitoso con Token JWT.  
   - Error `403 Forbidden` cuando un `CLIENTE` intenta acceder a una función de `ADMIN`.  
   - Error `401 Unauthorized` cuando no se envía el token.

