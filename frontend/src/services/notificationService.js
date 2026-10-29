const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const notificationService = {
  /**
   * Obtiene la lista de notificaciones del usuario autenticado.
   * @param {string} token
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getNotifications(token) {
    try {
      const response = await fetch(`${API_URL}/notifications/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        return { success: false, error: 'Error al cargar notificaciones' }
      }
      const data = await response.json()
      return { success: true, data: Array.isArray(data) ? data : data.results || [] }
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' }
    }
  },

  /**
   * Marca una notificación como leída en el backend.
   * @param {number|string} id
   * @param {string} token
   */
  async markAsRead(id, token) {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      return { success: response.ok }
    } catch {
      return { success: false }
    }
  },

  /**
   * Marca todas las notificaciones del usuario como leídas.
   * @param {string} token
   */
  async markAllAsRead(token) {
    try {
      const response = await fetch(`${API_URL}/notifications/mark-all-read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      return { success: response.ok }
    } catch {
      return { success: false }
    }
  },
}
