import { useContext } from 'react'
import { CartContext } from '../contexts/CartContext'

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    return {
      cart: { items: [] },
      items: [],
      itemCount: 0,
      totalAmount: 0,
      currentStoreId: null,
      loading: false,
      error: null,
      addToCart: async () => ({ success: false }),
      updateQuantity: async () => ({ success: false }),
      removeItem: async () => ({ success: false }),
      clearCart: async () => ({ success: false }),
      refreshCart: async () => {},
    }
  }
  return context
}
