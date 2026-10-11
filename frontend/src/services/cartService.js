/**
 * Capa de servicio para operaciones de Carrito de Compras en FoodRush (TP9).
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const cartService = {
  /**
   * Obtiene o inicializa el carrito activo del usuario autenticado.
   *
   * @param {string} token - JWT Bearer token
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async getOrCreateCart(token) {
    try {
      const response = await fetch(`${API_URL}/carts/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: data.detail || 'Error al obtener el carrito' }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión con el carrito' }
    }
  },

  /**
   * Agrega un ítem al carrito.
   *
   * @param {Object} params
   * @param {number} params.cartId
   * @param {number} params.productId
   * @param {number} params.quantity
   * @param {string} token
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async addItemToCart({ cartId, productId, quantity = 1 }, token) {
    try {
      const response = await fetch(`${API_URL}/cart-items/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: cartId,
          product: productId,
          quantity,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || (Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : 'Error al agregar producto al carrito'),
        }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al agregar ítem' }
    }
  },

  /**
   * Modifica la cantidad de un ítem en el carrito.
   *
   * @param {number} itemId
   * @param {number} quantity
   * @param {string} token
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async updateItemQuantity(itemId, quantity, token) {
    try {
      const response = await fetch(`${API_URL}/cart-items/${itemId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: data.detail || 'Error al actualizar cantidad' }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al actualizar ítem' }
    }
  },

  /**
   * Elimina un ítem específico del carrito.
   *
   * @param {number} itemId
   * @param {string} token
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async removeItemFromCart(itemId, token) {
    try {
      const response = await fetch(`${API_URL}/cart-items/${itemId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        return { success: false, error: data.detail || 'Error al eliminar el ítem' }
      }
      return { success: true }
    } catch {
      return { success: false, error: 'Error de conexión al eliminar ítem' }
    }
  },
}
