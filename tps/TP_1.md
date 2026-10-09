# Trabajo Practico N°1

## Puesta en marcha del backend con Django y Django REST Framework

## Objetivo

En este primer trabajo practico vamos a crear la base del proyecto backend. La idea es dejar preparado un entorno de desarrollo funcional con Django y Django REST Framework, de forma que al finalizar ya podamos levantar el servidor local, entrar al panel de administracion y tener una estructura inicial sobre la cual seguir construyendo el resto del sistema.

Este TP es importante porque todo lo que hagamos mas adelante va a apoyarse sobre esta base: modelos, autenticacion, endpoints, documentacion, pruebas y conexion con el frontend.

## Que vamos a construir

Durante la cursada vamos a desarrollar una aplicacion web completa. En una primera etapa vamos a trabajar sobre el backend, que sera el encargado de:

- almacenar la informacion en la base de datos,  
- exponer una API REST,  
- administrar usuarios,  
- y responder a las peticiones del frontend.

En este TP no vamos a desarrollar toda la logica de negocio todavia. Vamos a dejar listo el proyecto para comenzar a hacerlo en los siguientes trabajos practicos.

## Requisitos previos

Antes de comenzar, verificar que el equipo tenga instalado:

- Python 3  
- pip  
- Visual Studio Code o un editor equivalente  
- Git  
- Una cuenta de GitHub o una plataforma similar para alojar el repositorio

Para comprobar que Python y pip estan disponibles, se puede ejecutar:

python \--version

pip \--version

## Entregables

Al finalizar este trabajo practico se espera tener:

- un repositorio creado y clonado localmente,  
- un entorno virtual funcionando,  
- Django y DRF instalados,  
- el proyecto backend creado,  
- una aplicacion base creada dentro del proyecto,  
- las migraciones iniciales aplicadas,  
- un superusuario creado,  
- el servidor funcionando en local,  
- y un `README.md` con los pasos de instalacion y ejecucion.

## Paso 1: Crear el repositorio

Crear un nuevo repositorio en GitHub con el nombre del proyecto que se va a utilizar durante la cursada.

Este sera el unico repositorio del proyecto completo. En el mismo repositorio se ira construyendo primero el backend y mas adelante tambien el frontend.

Luego clonarlo en la maquina local:

git clone \<URL\_DEL\_REPOSITORIO\>

cd \<NOMBRE\_DEL\_REPOSITORIO\>

Este paso sirve para empezar a versionar el proyecto desde el inicio y mantener un historial ordenado de cambios.

Mas adelante, cuando se cree React, no se abrira un repositorio nuevo: el frontend se agregara dentro de este mismo proyecto, normalmente en una carpeta llamada `frontend/`.

## Paso 2: Crear y activar un entorno virtual

Dentro de la carpeta del proyecto, crear un entorno virtual:

python \-m venv venv

Activarlo:

source venv/bin/activate

Si estas trabajando en Windows con PowerShell, el comando puede variar:

venv\\Scripts\\Activate.ps1

Usamos un entorno virtual para aislar las dependencias del proyecto y evitar conflictos con otros desarrollos instalados en la misma computadora.

## Paso 3: Instalar las dependencias iniciales

Con el entorno activado, instalar las herramientas base del backend:

pip install django djangorestframework django-cors-headers drf-spectacular

Luego guardar esas dependencias en un archivo `requirements.txt`:

pip freeze \> requirements.txt

Estas librerias cumplen las siguientes funciones:

- `django`: framework principal del backend.  
- `djangorestframework`: permite construir APIs REST.  
- `django-cors-headers`: permite controlar el acceso desde otros origenes, por ejemplo el frontend en React.  
- `drf-spectacular`: se utilizara mas adelante para documentar la API.

## Paso 4: Crear el proyecto Django

Crear el proyecto principal en la raiz del repositorio:

django-admin startproject config .

El punto final indica que el proyecto se crea en la carpeta actual.

Despues de este paso deberian aparecer archivos como:

- `manage.py`  
- carpeta `config/`

## Paso 5: Crear una aplicacion base

Crear una app inicial llamada `core`:

python manage.py startapp core

En Django, un proyecto puede tener varias apps. Cada app suele agrupar una parte de la logica del sistema. En este caso comenzamos con una app base sobre la que luego podremos organizar el resto de funcionalidades.

## Paso 6: Registrar las aplicaciones necesarias en `settings.py`

Abrir el archivo `config/settings.py` y agregar en `INSTALLED_APPS`:

INSTALLED\_APPS \= \[

    ...,

    'rest\_framework',

    'corsheaders',

    'drf\_spectacular',

    'core',

\]

Tambien agregar el middleware de CORS:

MIDDLEWARE \= \[

    'corsheaders.middleware.CorsMiddleware',

    ...,

\]

Y configurar un origen permitido para desarrollo local:

CORS\_ALLOWED\_ORIGINS \= \[

    'http\://localhost:3000',

\]

Mas adelante esto permitira que el frontend pueda comunicarse con el backend sin problemas de CORS.

## Paso 7: Aplicar las migraciones iniciales

Ejecutar:

python manage.py migrate

Esto crea las tablas iniciales que Django necesita para funcionar, por ejemplo las relacionadas con usuarios, permisos y administracion.

En esta primera etapa Django usara su configuracion por defecto, que normalmente trabaja con SQLite. Esto nos permite comprobar rapidamente que el proyecto arranca y que el entorno esta bien preparado.

En el proximo TP vamos a reemplazar esa base por PostgreSQL, que sera la base principal del proyecto.

## Paso 8: Crear un superusuario

Ejecutar:

python manage.py createsuperuser

Completar los datos solicitados por consola.

Este usuario permitira ingresar al panel de administracion de Django y gestionar informacion del sistema.

## Paso 9: Levantar el servidor local

Iniciar el servidor de desarrollo:

python manage.py runserver

Si todo esta correcto, el backend deberia quedar disponible en:

http\://127.0.0.1:8000/

Y el panel de administracion en:

http\://127.0.0.1:8000/admin/

Ingresar con el superusuario creado en el paso anterior para verificar que el sistema funciona correctamente.

## Paso 10: Documentar el proyecto en el README

Crear o completar un archivo `README.md` en la raiz del proyecto incluyendo como minimo:

- nombre del proyecto,  
- objetivo general,  
- requisitos previos,  
- pasos de instalacion,  
- como activar el entorno virtual,  
- como levantar el servidor.

Documentar desde el principio ayuda a que cualquier integrante del equipo pueda preparar el proyecto sin depender de explicaciones externas.

## Resultado esperado

Al terminar este trabajo practico deberias tener un backend inicial completamente operativo, con esta secuencia validada:

1. el repositorio existe y esta versionado,  
2. el entorno virtual funciona,  
3. las dependencias quedaron instaladas,  
4. Django inicia correctamente,  
5. el panel admin responde,  
6. y ya existe una estructura base para continuar con el modelado de datos en el proximo TP.

## Recomendaciones finales

- Hacer un commit una vez terminado este TP.  
- Usar mensajes claros, por ejemplo: `init backend with django and drf`.  
- No subir la carpeta `venv` al repositorio.  
- Agregar un archivo `.gitignore` si todavia no existe.

## Proximo paso

En el siguiente trabajo practico vamos a comenzar con el modelado de datos del sistema, la conexion a la base de datos y la creacion de los primeros endpoints CRUD de la API.  
