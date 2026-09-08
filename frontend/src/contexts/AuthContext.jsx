import { createContext, useState, useEffect, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  const getToken = () => localStorage.getItem('access_token')
  const getRefreshToken = () => localStorage.getItem('refresh_token')

  const isTokenExpired = (token) => {
    if (!token) return true
    try {
      const payloadBase64 = token.split('.')[1]
      const decodedJson = atob(payloadBase64)
      const decoded = JSON.parse(decodedJson)
      const now = Math.floor(Date.now() / 1000)
      return decoded.exp < now
    } catch {
      return true
    }
  }

  const logoutLocal = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
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
        localStorage.setItem('access_token', data.access)
        return data.access
      }
      return null
    } catch {
      logoutLocal()
      return null
    }
  }, [logoutLocal])

  const getValidToken = useCallback(async () => {
    const token = getToken()
    if (!token) return null

    if (!isTokenExpired(token)) {
      return token
    }

    return await refreshAccessToken()
  }, [refreshAccessToken])

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
  }, [refreshAccessToken, logoutLocal])

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

      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)

      const userData = data.user || { email }
      localStorage.setItem('user', JSON.stringify(userData))
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
      } catch {
        // Silenciosamente continuar con el borrado local
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