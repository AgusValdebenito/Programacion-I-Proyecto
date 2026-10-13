/**
 * Capa de servicio para operaciones sobre Productos en FoodRush (TP9).
 * Desacopla la lógica de red de las vistas de catálogo y administración.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function extractErrorMessage(data, defaultMsg) {
  if (!data || typeof data !== 'object') return defaultMsg
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) return data.non_field_errors[0]
  if (Array.isArray(data.image) && data.image.length) return data.image[0]
  if (Array.isArray(data.price) && data.price.length) return data.price[0]
  if (Array.isArray(data.name) && data.name.length) return data.name[0]
  if (Array.isArray(data.stock) && data.stock.length) return data.stock[0]
  const firstVal = Object.values(data)[0]
  if (Array.isArray(firstVal) && firstVal.length) return firstVal[0]
  if (typeof firstVal === 'string') return firstVal
  return defaultMsg
}

export const productService = {
  /**
   * Obtiene la lista de productos con soporte para filtros de búsqueda y tienda.
   *
   * @param {Object} [params]
   * @param {string} [params.search] - Búsqueda por texto (nombre / descripción)
   * @param {number|string} [params.store] - ID de la tienda
   * @param {boolean} [params.is_available] - Filtro de disponibilidad
   * @returns {Promise<{ success: boolean, data?: any[], error?: string }>}
   */
  async getProducts(params = {}) {
    const query = new URLSearchParams()
    if (params.search) query.append('search', params.search)
    if (params.store) query.append('store', params.store)
    if (params.is_available !== undefined) query.append('is_available', params.is_available)

    const queryString = query.toString() ? `?${query.toString()}` : ''

    try {
      const response = await fetch(`${API_URL}/products/${queryString}`, {
        method: 'GET',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { success: false, error: errorData.detail || 'Error al obtener productos' }
      }
      const data = await response.json()
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' }
    }
  },

  /**
   * Obtiene la ficha de un producto individual por su ID.
   *
   * @param {number|string} id
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async getProductById(id) {
    try {
      const response = await fetch(`${API_URL}/products/${id}/`, {
        method: 'GET',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { success: false, error: errorData.detail || 'Producto no encontrado' }
      }
      const data = await response.json()
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al obtener el producto' }
    }
  },

  /**
   * Crea un nuevo producto (requiere rol VENDEDOR o ADMIN).
   *
   * @param {Object} productPayload
   * @param {string} token - Token JWT Bearer
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async createProduct(productPayload, token) {
    try {
      const response = await fetch(`${API_URL}/products/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productPayload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: extractErrorMessage(data, 'Error al crear el producto') }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al crear el producto' }
    }
  },

  /**
   * Actualiza los datos de un producto (PATCH).
   *
   * @param {number|string} id
   * @param {Object} productPayload
   * @param {string} token
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async updateProduct(id, productPayload, token) {
    try {
      const response = await fetch(`${API_URL}/products/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productPayload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: extractErrorMessage(data, 'Error al actualizar el producto') }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al actualizar el producto' }
    }
  },

  /**
   * Elimina un producto por su ID (DELETE).
   *
   * @param {number|string} id
   * @param {string} token
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async deleteProduct(id, token) {
    try {
      const response = await fetch(`${API_URL}/products/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { success: false, error: errorData.detail || 'Error al eliminar el producto' }
      }
      return { success: true }
    } catch {
      return { success: false, error: 'Error de conexión al eliminar el producto' }
    }
  },
}
