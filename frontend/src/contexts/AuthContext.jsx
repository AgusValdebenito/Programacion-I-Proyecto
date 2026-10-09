import { createContext, useState, useEffect, useCallback } from 'react'
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  isTokenExpired,
  setStoredTokens,
} from '../utils/token'

const API_URL = import.meta.env.VITE_API_URL

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(true)

  const getToken = useCallback(() => getStoredAccessToken(), [])
  const getRefreshToken = useCallback(() => getStoredRefreshToken(), [])

  const logoutLocal = useCallback(() => {
    clearStoredTokens()
    setUser(null)
  }, [])

  const refreshAccessToken = useCallback(async () => {
    const refresh = getRefreshToken()
    if (!refresh || isTokenExpired(refresh)) {
      logoutLocal()
      return null
    }

    try {
      const response = await fetch(`${API_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      })

      if (!response.ok) {
        logoutLocal()
        return null
      }

      const data = await response.json()
      if (data.access) {
        setStoredTokens({ access: data.access })
        return data.access
      }
      return null
    } catch (err) {
      console.warn('Error al renovar el token de acceso:', err)
      logoutLocal()
      return null
    }
  }, [logoutLocal, getRefreshToken])

  const getValidToken = useCallback(async () => {
    const token = getToken()
    if (!token) return null

    if (!isTokenExpired(token)) {
      return token
    }

    return await refreshAccessToken()
  }, [refreshAccessToken, getToken])

  // Validar estado de sesión inicial al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken()
      if (token) {
        if (isTokenExpired(token)) {
          const newToken = await refreshAccessToken()
          if (!newToken) {
            logoutLocal()
          }
        }
      } else {
        logoutLocal()
      }
      setLoading(false)
    }

    initAuth()
  }, [refreshAccessToken, logoutLocal, getToken])

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.detail || (typeof data === 'string' ? data : (data.non_field_errors?.[0] || 'Credenciales incorrectas'))
        return { success: false, error: errorMsg }
      }

      const userData = data.user || { email }
      setStoredTokens({
        access: data.access,
        refresh: data.refresh,
        user: userData,
      })
      setUser(userData)

      return { success: true }
    } catch (err) {
      return { success: false, error: err.message || 'Error de conexión con el servidor' }
    }
  }

  const register = async (name, email, password, username) => {
    try {
      const userPayload = {
        username: username || email.split('@')[0],
        name,
        email,
        password,
        role: 'cliente'
      }

      const response = await fetch(`${API_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload)
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
    } catch (err) {
      return { success: false, error: err.message || 'Error de conexión con el servidor' }
    }
  }

  const logout = async () => {
    const refresh = getRefreshToken()
    const token = getToken()

    if (refresh && token) {
      try {
        await fetch(`${API_URL}/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ refresh })
        })
      } catch (err) {
        // Loguear advertencia y continuar con el borrado local de sesión
        console.warn('No se pudo comunicar el cierre de sesión al backend:', err)
      }
    }

    logoutLocal()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        getToken,
        isTokenExpired,
        getValidToken,
        refreshAccessToken
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}