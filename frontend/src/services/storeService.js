/**
 * Capa de servicio para operaciones sobre Tiendas/Comercios en FoodRush (TP9).
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const storeService = {
  /**
   * Obtiene la lista de todas las tiendas gastronómicas disponibles.
   *
   * @returns {Promise<{ success: boolean, data?: any[], error?: string }>}
   */
  async getStores() {
    try {
      const response = await fetch(`${API_URL}/stores/`, {
        method: 'GET',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { success: false, error: errorData.detail || 'Error al obtener tiendas' }
      }
      const data = await response.json()
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' }
    }
  },

  /**
   * Obtiene la información de una tienda individual por su ID.
   *
   * @param {number|string} id
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async getStoreById(id) {
    try {
      const response = await fetch(`${API_URL}/stores/${id}/`, {
        method: 'GET',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { success: false, error: errorData.detail || 'Tienda no encontrada' }
      }
      const data = await response.json()
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al obtener la tienda' }
    }
  },

  /**
   * Obtiene la tienda asociada al usuario autenticado actual.
   *
   * @param {string} token - Token JWT Bearer
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async getMyStore(token) {
    try {
      const response = await fetch(`${API_URL}/stores/my-store/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { success: false, error: errorData.detail || 'No se encontró tienda' }
      }
      const data = await response.json()
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al obtener mi tienda' }
    }
  },

  /**
   * Crea una nueva tienda para el usuario autenticado (promueve a rol vendedor).
   *
   * @param {Object} storeData
   * @param {string} token
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async createStore(storeData, token) {
    try {
      const response = await fetch(`${API_URL}/stores/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storeData),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: data.detail || 'Error al crear la tienda' }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al crear la tienda' }
    }
  },

  /**
   * Actualiza los datos de una tienda (PATCH).
   *
   * @param {number|string} id
   * @param {Object} storeData
   * @param {string} token
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async updateStore(id, storeData, token) {
    try {
      const response = await fetch(`${API_URL}/stores/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storeData),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: data.detail || 'Error al actualizar la tienda' }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al actualizar la tienda' }
    }
  },
}
