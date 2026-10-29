# 📋 Registro de Deuda Técnica y Mejoras Recomendadas (Roadmap TP10)

Este documento centraliza las observaciones técnicas, oportunidades de refactorización y recomendaciones de arquitectura surgidas durante la **Revisión de Código Senior del PR #47** y la preparación para el **TP10 (Despliegue y Puesta en Producción en la Nube)**.

---

## 📌 Resumen Ejecutivo de Hallazgos

| # | Módulo / Archivo | Criterio / Principio | Severidad | Acción Recomendada para TP10 |
| :-: | :--- | :--- | :---: | :--- |
| **1** | `frontend/src/views/PanelTienda.jsx` | Clean Code / Single Responsibility (SRP) | 🟡 Medio | Descomponer el *God Component* en subcomponentes (`StoreOverviewTab`, `StoreMenuTab`, `StoreOrdersTab`) y extraer hook `useStoreDashboard`. |
| **2** | `frontend/src/views/Checkout.jsx`<br>`frontend/src/views/Stores.jsx` | React Lifecycle / Pureza en Render | 🟡 Medio | Reemplazar actualizaciones síncronas de estado en el cuerpo del render (`setAddress`, `setPhone`, `setSearchQuery`) por valores derivados o `useEffect` explícitos. |
| **3** | `core/views.py` (`StoreViewSet.perform_update`) | Transaccionalidad DB (ACID) | 🟡 Medio | Envolver la suspensión en cascada (cancelación de órdenes, vaciado de carritos y notificaciones) dentro de `with transaction.atomic():`. |
| **4** | `frontend/src/hooks/useNotifications.js` | Rendimiento de Red / Acoplamiento | 🟡 Medio | Consolidar las 3-4 peticiones REST concurrentes al montar el Navbar en un endpoint unificado `GET /api/notifications/summary/`. |
| **5** | `media/products/*.jpg`<br>`media/stores/*.jpg` | DevOps / Gestión de Repositorio Cloud | 🔴 Para TP10 | Delegar el almacenamiento y serving de imágenes multimedia a un servicio en la nube (Cloudinary o AWS S3). |

---

## 🛠️ Detalle de Recomendaciones y Plan de Acción

### 1. Descomposición del *God Component* `PanelTienda.jsx`
* **Diagnóstico:** El archivo `frontend/src/views/PanelTienda.jsx` acumula más de 1.150 líneas y más de 30 llamadas a hooks de React. Gestiona en una sola unidad el onboarding de comercios, la edición de información de la tienda, el catálogo de productos con modales y el monitor de pedidos en cocina.
* **Impacto:** Dificulta el mantenimiento, testeo aislado y reutilización de submódulos.
* **Propuesta de Refactor:**
  1. Crear carpeta `frontend/src/views/panelTienda/` con submódulos:
     - `StoreOverviewTab.jsx`: Estadísticas generales y edición de datos del comercio.
     - `StoreMenuTab.jsx`: Grilla de platos, filtros de disponibilidad y modal de creación/edición.
     - `StoreOrdersTab.jsx`: Monitor de comandas de cocina y despachos.
  2. Extraer la lógica de comunicación con la API y estado a un custom hook: `frontend/src/hooks/useStoreDashboard.js`.

---

### 2. Eliminación de Actualizaciones de Estado Síncronas en el Render
* **Diagnóstico:** En `Checkout.jsx` y `Stores.jsx` se encontraron patrones condicionales que invocan setters de estado (`setAddress`, `setPhone`, `setSearchQuery`) directamente durante la fase de renderizado cuando el prop cambia respecto al estado local.
* **Impacto:** Provoca ciclos de re-render síncronos forzados advertidos por React en modo estricto (`Cannot update a component while rendering a different component`).
* **Propuesta de Refactor:**
  - Si el estado es puramente derivado de las props o del usuario autenticado, calcularlo al vuelo: `const effectiveAddress = userAddress || formAddress;`.
  - Si requiere sincronización con estado mutable local, encapsular la asignación inicial en `useEffect` con dependencias explícitas o inicializar el estado mediante funciones *lazy* en `useState(() => initialValue)`.

---

### 3. Transaccionalidad Estricta en Suspensión de Tiendas (`StoreViewSet`)
* **Diagnóstico:** En `core/views.py`, el método `perform_update` detecta cuando un comercio pasa de activo a suspendido (`is_active: True -> False`). Al detectarlo, cancela pedidos pendientes, limpia carritos y emite notificaciones. Sin embargo, estas operaciones ocurren en consultas individuales sin un bloque de transacción explícito.
* **Impacto:** Si la base de datos o el proceso se interrumpe a mitad de la operación, puede quedar la tienda desactivada pero con pedidos o carritos en estado inconsistente.
* **Propuesta de Refactor:**
  ```python
  from django.db import transaction

  def perform_update(self, serializer):
      old_is_active = self.get_object().is_active
      with transaction.atomic():
          store = serializer.save()
          if old_is_active and not store.is_active:
              OrderService.cancel_pending_orders_for_store(store)
              CartService.clear_carts_for_store(store)
              NotificationService.notify_store_moderation(store, action="suspended")
  ```

---

### 4. Consolidación de Consultas en Navbar (`useNotifications`)
* **Diagnóstico:** Al cargar cualquier vista de la aplicación, el hook `useNotifications` del Navbar dispara simultáneamente:
  - `GET /api/orders/` (pedidos del usuario cliente)
  - `GET /api/stores/my-store/` (verificación de si posee comercio)
  - `GET /api/orders/` filtrado para cocina (si es vendedor)
  - `GET /api/notifications/` (notificaciones del sistema)
* **Impacto:** Multiplica el tráfico HTTP innecesariamente en conexiones móviles de baja latencia o servidores gratuitos de cloud.
* **Propuesta de Refactor:**
  - Diseñar un endpoint ligero en Django: `GET /api/notifications/badge-summary/` que retorne en una sola respuesta el conteo de no leídos y la lista de alertas recientes para el usuario en sesión.

---

### 5. Almacenamiento de Multimedia en la Nube (Cloudinary / S3)
* **Diagnóstico:** El repositorio incluye imágenes estáticas de comercios y platos en la carpeta `media/` trackeadas por Git (~14 MB).
* **Impacto:** Aumenta el tamaño del clonado del repositorio y los servicios de despliegue PaaS (como Render o Vercel) tienen sistemas de archivos efímeros que borran las imágenes subidas por los usuarios al reiniciar.
* **Propuesta de Refactor:**
  - Instalar `django-cloudinary-storage`.
  - Configurar `DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'` en producción (`FoodRush/settings.py`).
  - Utilizar variables de entorno `CLOUDINARY_URL` o claves API en Render/Railway.
