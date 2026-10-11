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
}
