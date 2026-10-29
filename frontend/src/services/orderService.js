/**
 * Capa de servicio para operaciones sobre Pedidos/Órdenes en FoodRush (TP9).
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const orderService = {
  /**
   * Obtiene la lista de pedidos del usuario autenticado (o de las tiendas si es vendedor).
   *
   * @param {string} token
   * @returns {Promise<{ success: boolean, data?: any[], error?: string }>}
   */
  async getOrders(token) {
    try {
      const response = await fetch(`${API_URL}/orders/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: data.detail || 'Error al obtener los pedidos' }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión con el servicio de pedidos' }
    }
  },

  /**
   * Crea un nuevo pedido a partir del carrito.
   *
   * @param {Object} orderPayload
   * @param {string} token
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async createOrder(orderPayload, token) {
    try {
      const response = await fetch(`${API_URL}/orders/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: data.detail || 'Error al procesar el pedido' }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al crear el pedido' }
    }
  },

  /**
   * Actualiza el estado de un pedido (ej. pending -> preparing, o cancelación a cancelled).
   *
   * @param {number|string} orderId
   * @param {string} status
   * @param {string} token
   * @param {Object} [extraData={}] - Motivo de cancelación, plato causante, etc.
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async updateOrderStatus(orderId, status, token, extraData = {}) {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, ...extraData }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: data.detail || 'Error al cambiar estado del pedido' }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al actualizar estado' }
    }
  },

  /**
   * Obtiene los pedidos recibidos por una tienda específica (panel de vendedor/cocina).
   *
   * @param {number|string} storeId
   * @param {string} token
   * @returns {Promise<{ success: boolean, data?: any[], error?: string }>}
   */
  async getStoreOrders(storeId, token) {
    try {
      const response = await fetch(`${API_URL}/orders/?store=${storeId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: data.detail || 'Error al obtener los pedidos de la tienda' }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión con el servicio de pedidos' }
    }
  },

  /**
   * Califica un pedido entregado con puntuación, motivos y comentario (Issue #44).
   *
   * @param {number|string} orderId
   * @param {Object} ratingPayload - { rating: number, tags?: string[], comment?: string }
   * @param {string} token
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async rateOrder(orderId, ratingPayload, token) {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/rate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ratingPayload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: data.detail || 'Error al calificar el pedido' }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al enviar la calificación' }
    }
  },
}
