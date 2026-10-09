# Trabajo Práctico N°4

## Validación de API, Casos de Borde y Flujo de Corrección (PR)

### 🎯 Objetivo

Verificar la robustez de la API mediante pruebas manuales exhaustivas utilizando Postman. El foco es validar que las reglas de negocio se cumplan y que el sistema de roles (implementado en tps anteriores) funcione correctamente, siguiendo un flujo de trabajo profesional para la corrección de errores mediante Pull Requests.

---

### 🧠 Fundamento Técnico: Pruebas Manuales y Ciclo de Vida del Bug

En el mundo real, antes de automatizar tests, un QA (Quality Assurance) o un desarrollador realiza pruebas exploratorias. El objetivo es encontrar **Casos de Borde (Edge Cases)**: situaciones que el desarrollador no previó y que pueden causar errores críticos.

#### Conceptos Clave:

1. **Pruebas de Rol**: Verificar que un usuario con rol `CLIENTE` no pueda ejecutar acciones de `ADMIN` (ej: borrar un producto). Si la API permite esto, hay una falla de seguridad.  
2. **Validación de Reglas de Negocio**: Asegurar que la lógica sea coherente. Ejemplo: ¿Se puede crear un pedido con stock insuficiente? ¿Se puede comprar un producto con precio negativo?  
3. **El Flujo de PR (Pull Request)**: En proyectos profesionales, no se suben cambios directamente a la rama principal (`main`). Se crea una rama, se corrige el error y se propone el cambio mediante un PR para que otro desarrollador lo revise.

---

### 🛠️ Actividades

#### Paso 1: Diseño de la Matriz de Pruebas

Antes de abrir Postman, el alumno debe crear un documento (Markdown) con la matriz de pruebas. Debe incluir:

- **Endpoint**: (ej: `DELETE /api/products/1/`)  
- **Rol utilizado**: (ej: `CLIENTE`)  
- **Acción**: "Intentar borrar un producto"  
- **Resultado Esperado**: `403 Forbidden` (porque el cliente no tiene permiso).

#### Paso 2: Ejecución de Pruebas en Postman

Utilizando la colección de Postman, probar los siguientes escenarios:

1. **CRUD por Roles**:  
   - Crear, editar y borrar productos usando un `ADMIN`.  
   - Intentar lo mismo usando un `CLIENTE` (debería fallar).  
2. **Lógica de Negocio**:  
   - Intentar realizar una compra que supere el stock disponible.  
   - Crear un pedido con un carrito vacío.  
   - Intentar registrar un usuario con un email que ya existe.  
3. **Flujo Completo**:  
   - `Login` \$\\rightarrow\$ `Búsqueda` \$\\rightarrow\$ `Compra` \$\\rightarrow\$ `Verificar Stock Final`.

#### Paso 3: Detección y Corrección (Flujo de PR)

Si durante las pruebas se encuentra un error (ej: el stock bajó a \-1 o un cliente pudo borrar un producto):

1. **Crear una rama**: `git checkout -b fix/nombre-del-error`.  
2. **Corregir el error** en el código del backend.  
3. **Validar la corrección** en Postman.  
4. **Subir la rama y crear un PR**: Subir los cambios a GitHub y abrir un Pull Request describiendo el error encontrado y cómo se solucionó.

---

### 📦 Entregables

1. **Colección de Postman**: Exportar la colección en formato JSON con todas las peticiones organizadas por carpetas (Roles, Lógica, Flujos).  
2. **Documento de Pruebas**: Un reporte donde se detallen los casos probados, el resultado obtenido y si hubo errores.  
3. **Evidencia de PRs**: Enlaces a los Pull Requests creados para corregir los errores encontrados durante la fase de pruebas.  
4. **Capturas de pantalla**: Evidencia de las respuestas `401 Unauthorized` y `403 Forbidden` al probar roles incorrectos.

