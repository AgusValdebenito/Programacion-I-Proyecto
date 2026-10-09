# 📝 Trabajo Práctico N°6: Maquetado de la Home con Bootstrap

## 🎯 Objetivo

Desarrollar la **vista principal (Home)** del proyecto frontend utilizando el framework **Bootstrap**, asegurando un diseño **responsive** que se adapte a móviles, tablets y PC. Este TP sienta la base visual sobre la que en el TP7 se montarán el login y el registro.

---

## 📦 Entregables

- Home maquetada con Bootstrap  
- Diseño responsive adaptado a distintos tamaños de pantalla  
- Componentes organizados dentro de `frontend/src/components/`  
- Mismo repositorio del proyecto con ramas organizadas y commits claros

---

## 🛠️ Actividades

### 1\. Crear y preparar la rama de trabajo

- Crear una nueva rama desde `main`, por ejemplo:  
  `feature/home-bootstrap`

### 2\. Integrar Bootstrap al proyecto

- Instalar Bootstrap desde la carpeta `frontend/`:  
    
  npm install bootstrap  
    
- Importar los estilos en `frontend/src/main.jsx`:  
    
  import 'bootstrap/dist/css/bootstrap.min.css'  
    
- Verificar que los estilos se apliquen (por ejemplo, que un `<button className="btn btn-primary">` cambie de aspecto).

### 3\. Organizar la estructura de componentes

- Crear la carpeta `frontend/src/components/` para agrupar las piezas de UI reutilizables.  
- Componentes mínimos sugeridos:  
  - `Navbar`: barra de navegación superior con el nombre del proyecto.  
  - `Footer`: pie de página.  
  - `Home`: vista principal que compone los demás componentes.  
- Crear la carpeta `frontend/src/views/` (o `pages/`) para las vistas completas. En este TP al menos `Home`.

### 4\. Maquetar la Home con el sistema de grillas

- Usar el **grid system** de Bootstrap (`container`, `row`, `col`) para distribuir el contenido.  
- Incluir al menos:  
  - Un **hero** o encabezado principal con el título del proyecto y un llamado a la acción.  
  - Una sección de **tarjetas** (`card`) mostrando contenido de ejemplo.  
  - Un **footer**.  
- Acompañar con utilidades como `text-center`, `py-5`, `bg-*` y `mb-*` para el espaciado.

### 5\. Garantizar diseño responsive

- Probar la Home en distintos anchos de pantalla (con las herramientas de inspección del navegador o redimensionando la ventana).  
- Ajustar el número de columnas según el breakpoint: por ejemplo `col-md-4` para que las tarjetas se apilen en móvil y se muestren en fila en pantallas medianas.  
- Verificar que la navegación y el contenido no se rompan en pantallas chicas.

### 6\. Ejecutar y verificar

- Levantar el frontend:  
    
  npm run dev  
    
- Confirmar que la Home se ve en `http://localhost:3000`.

---

## ✅ Resultado Esperado

- Home maquetada con Bootstrap, coherente y responsive  
- Estructura de componentes clara dentro de `frontend/src/components/` y `frontend/src/views/`  
- Código limpio y versionado en la rama `feature/home-bootstrap`

---

## 📚 Nota sobre el siguiente TP

En el TP7 se agregarán las vistas de Login y Registro sobre esta misma base de Bootstrap, con la lógica de autenticación hardcodeada.  
