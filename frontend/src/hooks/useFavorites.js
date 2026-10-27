import { useContext } from 'react'
import { FavoritesContext } from '../contexts/FavoritesContext'

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    return {
      favorites: [],
      favoriteIds: new Set(),
      loading: false,
      isFavorite: () => false,
      toggleFavorite: async () => ({ success: false }),
    }
  }
  return context
}
