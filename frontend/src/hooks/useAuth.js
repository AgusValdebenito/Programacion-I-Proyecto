import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    return {
      user: null,
      loading: false,
      login: async () => ({ success: false }),
      register: async () => ({ success: false }),
      logout: async () => {},
      getToken: () => null,
      getRefreshToken: () => null,
      getValidToken: async () => null,
      setUser: () => {},
    }
  }
  return context
}
