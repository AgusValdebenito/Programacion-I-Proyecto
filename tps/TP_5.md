# Trabajo Práctico N°5

## Inicio del Proyecto React

### 🎯 Objetivo

Poner en marcha un servidor React que se ejecute en el **puerto 3000** dentro del **mismo repositorio** del backend, y preparar el bosquejo del diseño de la aplicación. Este TP marca el salto de "solo backend" a una arquitectura de dos capas: API (Django) \+ Cliente (React).

---

### 🧠 Fundamento Técnico: ¿Por qué hacemos esto?

#### 1\. ¿Qué es un SPA (Single Page Application)?

Hasta ahora el servidor Django renderizaba las respuestas. React plantea un modelo distinto: el navegador descarga una **única página HTML** y el contenido se va actualizando en el cliente vía JavaScript. El servidor solo entrega **datos** (JSON), no HTML. Por eso la separación en dos carpetas del mismo repo tiene sentido.

#### 2\. Vite: el andamiaje

Crear un proyecto React a mano (empaquetador, transpilador, dev server) lleva horas de configuración. **Vite** genera un **andamiaje estándar y listo para correr**, con un servidor de desarrollo muy rápido gracias a ESBuild/Rollup y Hot Module Replacement (HMR) instantáneo. Es intencional que Python y JS convivan: cada tecnología resuelve lo que mejor sabe.

> **Nota:** Anteriormente este TP usaba `create-react-app` (CRA), la herramienta clásica para iniciar proyectos React. El equipo de React **deprecó oficialmente CRA en febrero de 2025**: ya no recibe actualizaciones, nuevas features ni parches de seguridad. Por eso migramos a **Vite**, la alternativa moderna recomendada actualmente por el propio equipo de React (junto con frameworks como Next.js o Remix). `npm` (el gestor de paquetes) **no está deprecado** — seguimos usándolo para instalar Vite y todas las dependencias del proyecto.

#### 3\. Componentes: la unidad básica de React

React se construye con **componentes** (piezas de UI reutilizables que combinan estructura y lógica). En este TP empezamos a entender que una "home" no es un archivo, sino una composición de componentes más chicos.

#### 4\. Estructura del repositorio: un repo, dos mundos

El frontend **NO** va en un repositorio distinto: vive en una **carpeta propia `frontend/` dentro del mismo repo git** que el backend. Esto refleja la arquitectura real de dos capas (API \+ Cliente) conviviendo en un único versionado. La estructura final que buscamos es:

programacion-1/          ← repositorio git (raíz)

├── backend/             ← la API Django (lo visto hasta TP4)

│   ├── config/

│   └── core/ users/

└── frontend/            ← el cliente React (empieza en TP5)

La raíz del repositorio contiene DOS carpetas: el backend y el frontend. Nada de mezclarlos.  
Si no esta la carpeta backend, dejarlo como está y crear la carpeta fronted igualmente

---

### 🛠️ Actividades

#### Paso 1: Preparar el repositorio

1. **No crear un repo nuevo**: trabajar sobre el mismo repositorio del backend.  
     
2. Crear un directorio dentro del repositorio llamado `frontend`.  
     
3. Crear la rama de trabajo:  
     
   git checkout \-b feature/start-react-project  
     
   (o `tp5` o `feature/tp5`)

#### Paso 2: Entender dónde vive cada cosa

1. Verificar la raíz del repositorio: aquí conviven `backend/` (Django) y la nueva `frontend/` (React).  
2. A partir de este TP, **todo el código de frontend se escribe dentro de `frontend/`**, jamás en la raíz ni en `backend/`.

#### Paso 3: Instalar Node.js

1. Descargar Node.js desde [https\://nodejs.org/](https://nodejs.org/)  
     
2. Verificar la instalación:  
     
   node \-v  
     
   npm \-v

#### Paso 4: Crear el proyecto React con Vite

1. Ubicarse en la raíz del repositorio y ejecutar:  
     
   npm create vite@latest frontend \-- \--template react  
     
2. Instalar las dependencias:  
     
   cd frontend  
     
   npm install  
     
3. El comando crea la carpeta `frontend/` **al nivel de `backend/`**, dentro del mismo repo. El frontend así queda **separado del backend pero versionado en conjunto**.  
     
4. Por defecto, Vite sirve la app en el puerto **5173**. Para mantener el puerto **3000** (consistente con el resto del TP y con configuraciones de CORS ya hechas en el backend), agregar/editar el archivo `vite.config.js`:  
     
   import { defineConfig } from 'vite'  
     
   import react from '@vitejs/plugin-react'  
     
   export default defineConfig({  
     
     plugins: \[react()\],  
     
     server: {  
     
       port: 3000,  
     
     },  
     
   })

#### Paso 5: Configurar el entorno de desarrollo

1. Abrir Visual Studio Code.  
2. Agregar el proyecto al workspace.

#### Paso 6: Documentar el diseño inicial

1. Realizar un **diagrama de la Home / estructura general del proyecto** (ideas de componentes o flujo).  
2. Guardar el diagrama en un directorio `docs/` o incluirlo en el `README.md`.

---

### 📦 Entregables

1. **Servidor React** funcionando en `http://localhost:3000`.  
2. **Repositorio** con el frontend en `frontend/` **al nivel de `backend/`**, con **ramas organizadas**.  
3. **Bosquejo / diagrama del diseño inicial.**

---

### ✅ Criterios de aprobación

- El frontend corre con `npm run dev` en el puerto 3000\.  
- Existe un directorio `frontend/` **hermano de `backend/`** dentro del mismo repositorio.  
- El diagrama de diseño está subido y versionado.  
- Los cambios están en la rama `feature/start-react-project` con commits claros.

