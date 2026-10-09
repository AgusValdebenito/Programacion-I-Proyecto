# Trabajo Práctico N°8

## Conexión del Frontend con el Backend

### 🎯 Objetivo

Reemplazar la autenticación hardcodeada del TP7 por llamadas reales a la API, y conectar la Home para que muestre datos reales. En este punto solo existen dos vistas (Login y Home), así que el foco es **el puente**: aprender a conectar el frontend al backend con solo esas dos pantallas.

---

### 🧠 Fundamento Técnico: ¿Por qué hacemos esto?

#### 1\. El momento del "cambio de testigo"

En el TP7 aprendiste a manejar autenticación con datos hardcodeados. En el TP8 **reemplazás** esos datos por la API real. Es el mismo código, con la misma lógica, pero la fuente de datos cambia. Si el login funcionaba con datos falsos, ahora debe funcionar igual con la API de Django.

#### 2\. Variables de entorno

La URL de la API (`http://localhost:8000/api`) **no debe estar hardcodeada** en cada componente. Se configura una sola vez en un archivo `.env` y se reutiliza en toda la app. Es una buena práctica que evita errores cuando pasás de desarrollo a producción.

#### 3\. Token: el pase del usuario

Cuando el usuario hace login, la API devuelve un **token JWT**. Ese token se guarda en el navegador (localStorage) y se envía en cada request para que el backend sepa quién es. Es como un carnet de identidad que el usuario muestra cada vez que entra a una zona protegida.

---

### 🛠️ Actividades

#### Paso 1: Preparar el entorno

1. Verificar que el **backend** esté corriendo (`python manage.py runserver`).  
2. Verificar que el **frontend** esté corriendo (`npm run dev`).  
3. Confirmar la URL base de la API.  
4. Crear un archivo `.env` en la raíz de `frontend/`:  
     
   VITE\_API\_URL=http\://localhost:8000/api  
     
5. Crear la rama de trabajo:  
     
   git checkout \-b feature/connect-api

#### Paso 2: Conectar el Login real

1. Reemplazar la validación hardcodeada del TP7 por una llamada real a la API.  
2. Usar `fetch` o `axios` para hacer `POST` a `/api/token/` con `username` y `password`.  
3. El backend (SimpleJWT) responde con los tokens `access` y `refresh`.  
4. Almacenar el `access` token en `localStorage`.  
5. Redirigir al usuario a la Home si el login es exitoso, y mostrar un error claro si no.  
6. **No olvidar**: adjuntar el token en el header `Authorization: Bearer <token>` en las peticiones autenticadas.

#### Paso 3: Conectar el Registro

1. Adaptar el formulario de registro del TP7 para que haga `POST` a `/api/register/` (o el endpoint que defina el backend).  
2. Notificar al usuario si el registro fue exitoso o si hubo errores.  
3. Redirigir al login después de un registro exitoso.

#### Paso 4: Manejo de sesión y Logout

1. Implementar logout: borrar el token de `localStorage` y limpiar el estado del usuario.  
2. Si el backend define un endpoint de logout (`POST /api/logout/`), llamarlo antes de borrar el token.  
3. Verificar que al cerrar sesión, las rutas protegidas redirijan al login.

#### Paso 5: Conectar la Home

1. Reemplazar los datos hardcodeados de la Home por una llamada `GET` a la API.  
2. Mostrar la información que devuelve el backend (por ejemplo, un saludo con el nombre del usuario logueado, o datos del perfil).  
3. Si la API devuelve un error (token expirado, no autenticado), mostrar un mensaje claro.

#### Paso 6: Proteger rutas

1. Verificar que `ProtectedRoute` del TP7 siga funcionando con el token real.  
2. Si el usuario no está autenticado (no hay token o expiró), redirigir al login.  
3. Las rutas protegidas solo deben ser accesibles con un token válido.

---

### 📦 Entregables

1. **Login funcional** conectado a la API real de Django.  
2. **Registro funcional** que crea usuarios en el backend.  
3. **Home conectada** mostrando datos reales del backend.  
4. **Logout** que limpia la sesión correctamente.  
5. **Protección de rutas** funcionando con JWT real.

---

### ✅ Criterios de aprobación

- Un usuario puede registrarse y loguearse con credenciales reales del backend.  
- El token se almacena y se envía en requests autenticadas.  
- La Home muestra datos reales del backend, no hardcodeados.  
- Al cerrar sesión, las rutas protegidas redirigen al login.  
- No hay URLs hardcodeadas: se usan variables de entorno.  
- Los cambios están en la rama `feature/connect-api` con commits claros.

---

### 📚 Recursos y documentación

- SimpleJWT: [https\://django-rest-framework-simplejwt.readthedocs.io/](https://django-rest-framework-simplejwt.readthedocs.io/)  
- Fetch API: [https\://developer.mozilla.org/en-US/docs/Web/API/Fetch\_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)  
- Axios (alternativa): [https\://axios-http.com/docs/intro](https://axios-http.com/docs/intro)  
- Variables de entorno en Vite: [https\://vitejs.dev/guide/env-and-mode](https://vitejs.dev/guide/env-and-mode)  
- Protección de rutas en React: [https\://reactrouter.com/en/main/start/tutorial\#protecting-routes](https://reactrouter.com/en/main/start/tutorial#protecting-routes)

