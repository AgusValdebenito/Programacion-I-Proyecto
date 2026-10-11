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
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async updateOrderStatus(orderId, status, token) {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
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
}
