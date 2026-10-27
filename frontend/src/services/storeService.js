/**
 * Capa de servicio para operaciones sobre Tiendas/Comercios en FoodRush (TP9).
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const storeService = {
  /**
   * Obtiene la lista de tiendas gastronómicas disponibles con soporte para búsqueda y ordenamiento.
   *
   * @param {Object} [params]
   * @param {string} [params.search] - Búsqueda por texto (nombre / descripción)
   * @param {string} [params.ordering] - Campo de ordenamiento (name, -name, created_at, id)
   * @param {string} [params.owner] - ID o 'me'
   * @param {boolean|string} [params.is_active] - Filtro de activas/suspendidas
   * @param {string} [params.token] - Token JWT opcional para resolver is_favorite por usuario
   * @returns {Promise<{ success: boolean, data?: any[], error?: string }>}
   */
  async getStores(params = {}) {
    try {
      const query = new URLSearchParams()
      if (params.search) query.set('search', params.search)
      if (params.ordering) query.set('ordering', params.ordering)
      if (params.owner) query.set('owner', params.owner)
      if (params.is_active !== undefined) query.set('is_active', String(params.is_active))
      const qs = query.toString() ? `?${query.toString()}` : ''

      const headers = {}
      if (params.token) {
        headers.Authorization = `Bearer ${params.token}`
      }

      const response = await fetch(`${API_URL}/stores/${qs}`, {
        method: 'GET',
        headers,
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
   * @param {string} [token] - Token JWT opcional
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async getStoreById(id, token) {
    try {
      const headers = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_URL}/stores/${id}/`, {
        method: 'GET',
        headers,
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

  /**
   * Alterna el estado activo/suspendido de una tienda (Solo Administrador).
   *
   * @param {number|string} id
   * @param {string} token
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async toggleActive(id, token) {
    try {
      const response = await fetch(`${API_URL}/stores/${id}/toggle-active/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: data.detail || 'Error al modificar estado de la tienda' }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al modificar estado de la tienda' }
    }
  },

  /**
   * Elimina una tienda definitivamente (Moderación Admin o Propietario).
   *
   * @param {number|string} id
   * @param {string} token
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async deleteStore(id, token) {
    try {
      const response = await fetch(`${API_URL}/stores/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        return { success: false, error: data.detail || 'Error al eliminar la tienda' }
      }
      return { success: true }
    } catch {
      return { success: false, error: 'Error de conexión al eliminar la tienda' }
    }
  },

  /**
   * Alterna el estado favorito de una tienda para el usuario autenticado (Issue #42).
   *
   * @param {number|string} id
   * @param {string} token
   * @returns {Promise<{ success: boolean, favorited?: boolean, store_id?: number, error?: string }>}
   */
  async toggleFavorite(id, token) {
    try {
      const response = await fetch(`${API_URL}/stores/${id}/toggle-favorite/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: data.detail || 'Error al actualizar favoritos' }
      }
      return { success: true, favorited: data.favorited, store_id: data.store_id }
    } catch {
      return { success: false, error: 'Error de conexión al actualizar favoritos' }
    }
  },

  /**
   * Obtiene la lista de tiendas guardadas como favoritas por el usuario (Issue #42).
   *
   * @param {string} token
   * @returns {Promise<{ success: boolean, data?: any[], error?: string }>}
   */
  async getFavoriteStores(token) {
    try {
      const response = await fetch(`${API_URL}/stores/favorites/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: data.detail || 'Error al obtener tiendas favoritas' }
      }
      return { success: true, data: Array.isArray(data) ? data : [] }
    } catch {
      return { success: false, error: 'Error de conexión al obtener tiendas favoritas' }
    }
  },
}
