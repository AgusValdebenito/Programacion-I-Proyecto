/**
 * Capa de servicio para la comunicación con los endpoints de autenticación y perfil del backend (TP8).
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const authService = {
  /**
   * Autentica a un usuario mediante email y password.
   */
  async login(email, password) {
    const response = await fetch(`${API_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) {
      const errorMsg =
        data.detail ||
        (typeof data === 'string'
          ? data
          : data.non_field_errors?.[0] || 'Credenciales incorrectas')
      return { success: false, error: errorMsg }
    }
    return { success: true, data }
  },

  /**
   * Registra a un nuevo usuario con rol cliente en el backend.
   */
  async register(userPayload) {
    const response = await fetch(`${API_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload),
    })
    const data = await response.json()
    if (!response.ok) {
      let errorMsg = 'Error al registrar el usuario'
      if (data.email) errorMsg = Array.isArray(data.email) ? data.email[0] : data.email
      else if (data.username) errorMsg = Array.isArray(data.username) ? data.username[0] : data.username
      else if (data.password) errorMsg = Array.isArray(data.password) ? data.password[0] : data.password
      else if (data.detail) errorMsg = data.detail
      return { success: false, error: errorMsg }
    }
    return { success: true, data }
  },

  /**
   * Solicita un nuevo token de acceso a partir de un refresh token vigente.
   */
  async refreshAccessToken(refresh) {
    const response = await fetch(`${API_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.access || null
  },

  /**
   * Cierra sesión notificando al backend para incluir el token en la lista negra.
   */
  async logout(refresh, accessToken) {
    if (!refresh || !accessToken) return
    await fetch(`${API_URL}/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh }),
    })
  },

  /**
   * Obtiene la información del perfil del usuario autenticado actual.
   */
  async getProfile(accessToken) {
    const response = await fetch(`${API_URL}/profile/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if (!response.ok) return null
    return await response.json()
  },
}
