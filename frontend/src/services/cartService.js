/**
 * Capa de servicio para operaciones de Carrito de Compras en FoodRush (TP9).
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function extractErrorMessage(data, defaultMsg) {
  if (!data || typeof data !== 'object') return defaultMsg
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) return data.non_field_errors[0]
  if (Array.isArray(data.quantity) && data.quantity.length) return data.quantity[0]
  if (Array.isArray(data.product) && data.product.length) return data.product[0]
  if (Array.isArray(data.store) && data.store.length) return data.store[0]
  const firstVal = Object.values(data)[0]
  if (Array.isArray(firstVal) && firstVal.length) return firstVal[0]
  if (typeof firstVal === 'string') return firstVal
  return defaultMsg
}

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
          error: extractErrorMessage(data, 'Error al agregar producto al carrito'),
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
        return { success: false, error: extractErrorMessage(data, 'Error al actualizar cantidad') }
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
        return { success: false, error: extractErrorMessage(data, 'Error al eliminar el ítem') }
      }
      return { success: true }
    } catch {
      return { success: false, error: 'Error de conexión al eliminar ítem' }
    }
  },

  /**
   * Obtiene el carrito activo del usuario con sus ítems anidados y datos de producto.
   *
   * @param {string} token
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async getActiveCart(token) {
    try {
      const response = await fetch(`${API_URL}/carts/active/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: extractErrorMessage(data, 'Error al obtener el carrito activo') }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al obtener el carrito activo' }
    }
  },

  /**
   * Vacía todos los ítems del carrito activo.
   *
   * @param {string} token
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async clearCart(token) {
    try {
      const response = await fetch(`${API_URL}/carts/clear/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        return { success: false, error: extractErrorMessage(data, 'Error al vaciar el carrito') }
      }
      return { success: true }
    } catch {
      return { success: false, error: 'Error de conexión al vaciar el carrito' }
    }
  },

  /**
   * Realiza el checkout atómico del carrito activo, convirtiéndolo en un pedido.
   *
   * @param {string} token
   * @param {Object} [deliveryData={}]
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async checkout(token, deliveryData = {}) {
    try {
      const response = await fetch(`${API_URL}/carts/checkout/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryData),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return {
          success: false,
          error: extractErrorMessage(data, 'Error al procesar el checkout'),
          errorCode: data?.error || (data?.detail && String(data.detail).includes('PRODUCT_UNAVAILABLE') ? 'PRODUCT_UNAVAILABLE' : null),
          unavailableProductIds: Array.isArray(data?.unavailable_product_ids)
            ? data.unavailable_product_ids.map(Number)
            : [],
        }
      }
      return { success: true, data }
    } catch {
      return { success: false, error: 'Error de conexión al procesar el checkout' }
    }
  },
}
