import { createContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  isTokenExpired,
  setStoredTokens,
} from '../utils/token'

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
      const newAccess = await authService.refreshAccessToken(refresh)
      if (newAccess) {
        setStoredTokens({ access: newAccess })
        return newAccess
      }

      logoutLocal()
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
      const result = await authService.login(email, password)
      if (!result.success) {
        return result
      }

      const { data } = result
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
        role: 'cliente',
      }

      return await authService.register(userPayload)
    } catch (err) {
      return { success: false, error: err.message || 'Error de conexión con el servidor' }
    }
  }

  const logout = async () => {
    const refresh = getRefreshToken()
    const token = getToken()

    if (refresh && token) {
      try {
        await authService.logout(refresh, token)
      } catch (err) {
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
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}