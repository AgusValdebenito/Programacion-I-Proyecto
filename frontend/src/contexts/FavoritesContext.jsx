import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { storeService } from '../services/storeService'

// eslint-disable-next-line react-refresh/only-export-components
export const FavoritesContext = createContext()

export function FavoritesProvider({ children }) {
  const { user, getValidToken } = useAuth()
  const storageKey = useMemo(() => `foodrush_favorites_${user?.id || 'guest'}`, [user?.id])

  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(`foodrush_favorites_${user?.id || 'guest'}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [prevStorageKey, setPrevStorageKey] = useState(storageKey)
  const [loading, setLoading] = useState(false)

  // Ajuste durante el render si cambia el usuario/clave (patrón oficial de React)
  if (prevStorageKey !== storageKey) {
    setPrevStorageKey(storageKey)
    try {
      const stored = localStorage.getItem(storageKey)
      setFavorites(stored ? JSON.parse(stored) : [])
    } catch {
      setFavorites([])
    }
  }

  // Sincronizar asíncronamente con el backend cuando cambia el usuario
  useEffect(() => {
    let isMounted = true

    const syncWithBackend = async () => {
      const token = await getValidToken()
      if (!token) return

      setLoading(true)
      try {
        const res = await storeService.getFavoriteStores(token)
        if (isMounted && res.success && Array.isArray(res.data)) {
          setFavorites(res.data)
          localStorage.setItem(storageKey, JSON.stringify(res.data))
        }
      } catch (err) {
        console.warn('No se pudieron sincronizar los favoritos con el backend:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    syncWithBackend()

    return () => {
      isMounted = false
    }
  }, [storageKey, getValidToken])

  const favoriteIds = useMemo(() => {
    return new Set(favorites.map((s) => Number(s.id)))
  }, [favorites])

  const isFavorite = useCallback(
    (storeId) => {
      if (!storeId) return false
      return favoriteIds.has(Number(storeId))
    },
    [favoriteIds]
  )

  const toggleFavorite = useCallback(
    async (store) => {
      if (!store || !store.id) return { success: false }

      const storeId = Number(store.id)
      const wasFavorite = favoriteIds.has(storeId)
      const nextFavorited = !wasFavorite

      // Actualización optimista inmediata
      const prevFavorites = [...favorites]
      let nextFavorites
      if (wasFavorite) {
        nextFavorites = favorites.filter((s) => Number(s.id) !== storeId)
      } else {
        nextFavorites = [store, ...favorites]
      }

      setFavorites(nextFavorites)
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextFavorites))
      } catch {
        // Ignorar quota errors en storage
      }

      // Sincronizar con backend si está autenticado
      const token = await getValidToken()
      if (token) {
        try {
          const res = await storeService.toggleFavorite(storeId, token)
          if (!res.success) {
            // Revertir ante error
            setFavorites(prevFavorites)
            try {
              localStorage.setItem(storageKey, JSON.stringify(prevFavorites))
            } catch {
              // ignore
            }
            return { success: false, error: res.error }
          }
        } catch {
          // Revertir ante excepción de red
          setFavorites(prevFavorites)
          try {
            localStorage.setItem(storageKey, JSON.stringify(prevFavorites))
          } catch {
            // ignore
          }
          return { success: false, error: 'Error de red al actualizar favoritos' }
        }
      }

      return { success: true, favorited: nextFavorited }
    },
    [favorites, favoriteIds, getValidToken, storageKey]
  )

  const value = useMemo(
    () => ({
      favorites,
      favoriteIds,
      loading,
      isFavorite,
      toggleFavorite,
    }),
    [favorites, favoriteIds, loading, isFavorite, toggleFavorite]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
