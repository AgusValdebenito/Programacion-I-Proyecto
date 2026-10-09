# 📝 Trabajo Práctico N°7: Login, Registro y Control de Acceso (hardcodeado)

## 🎯 Objetivo

Implementar el sistema de autenticación del frontend con **registro**, **login**, **logout** y **control de acceso a la Home**, pero **sin conectar todavía al backend**: los usuarios se validan contra datos **hardcodeados** en memoria. El objetivo es dominar el flujo de autenticación en React (estado, contexto, rutas protegidas) antes de conectarlo a la API real en el TP8.

---

## 📦 Entregables

- Proyecto React con login, registro y logout funcionando con datos hardcodeados  
- Acceso a la Home solo para usuarios autenticados  
- Vistas de Login y Registro maquetadas con Bootstrap  
- Mismo repositorio del proyecto con ramas organizadas y commits claros

---

## 🛠️ Actividades

### 1\. Crear y preparar la rama de trabajo

- Crear una nueva rama, por ejemplo: `feature/auth-system`

### 2\. Agregar el enrutado

- Instalar React Router desde `frontend/`:  
    
  npm install react-router-dom  
    
- Definir rutas base: `/` (Home), `/login` y `/register`.

### 3\. Implementar el contexto de autenticación

- Crear `AuthContext` para manejar el estado global del usuario.  
- Incluir funciones `login`, `logout` y `register` con datos hardcodeados:  
  - `login`: verifica usuario y contraseña contra una lista fija definida en el código.  
  - `register`: agrega el nuevo usuario al estado (no persistente).  
  - `logout`: limpia el usuario actual.

### 4\. Crear la vista de Login

- Formulario de usuario y contraseña maquetado con Bootstrap (`form-control`, `btn btn-primary`).  
- Validación contra los datos hardcodeados.  
- Redirección a la Home si el login es exitoso.  
- Mostrar un error si las credenciales no coinciden.

### 5\. Crear la vista de Registro

- Formulario para registrar un nuevo usuario, maquetado con Bootstrap.  
- Agregar el nuevo usuario al estado (no persistente).  
- Redirigir al Login o a la Home tras registrarse.

### 6\. Crear el Logout

- Botón para cerrar sesión y redirigir al Login.  
- Colocarlo en la barra de navegación de la Home.

### 7\. Proteger la ruta Home

- Crear el componente `ProtectedRoute`.  
- Si el usuario no está autenticado, redirigir al Login. (si corresponde)  
- Envolver la Home con `ProtectedRoute` para restringir su acceso.

---

## ✅ Resultado Esperado

- El usuario puede registrarse, iniciar y cerrar sesión sin backend  
- El acceso a la Home está restringido a usuarios autenticados  
- Navegación controlada y coherente  
- Código organizado, maquetado con Bootstrap y versionado correctamente

---

## 📚 Nota sobre el siguiente TP

En el TP8 estos datos hardcodeados se reemplazan por las llamadas reales a la API: el login consumirá `POST /api/token/` y el registro `POST /api/register/`.  
