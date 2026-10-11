import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { cartService } from '../services/cartService'

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext()

export function CartProvider({ children }) {
  const { user, getValidToken } = useAuth()
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(() => Boolean(user))
  const [error, setError] = useState(null)
  const [prevUser, setPrevUser] = useState(user)

  if (user !== prevUser) {
    setPrevUser(user)
    if (!user) {
      setCart({ items: [] })
      setLoading(false)
    } else {
      setLoading(true)
    }
  }

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] })
      setLoading(false)
      return
    }

    const token = await getValidToken()
    if (!token) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await cartService.getActiveCart(token)
      if (res.success && res.data) {
        setCart(res.data)
      } else {
        // Fallback: intentar inicializarlo si no existiera
        const initRes = await cartService.getOrCreateCart(token)
        if (initRes.success && initRes.data) {
          setCart(initRes.data)
        } else {
          setError(res.error || 'No se pudo cargar el carrito')
        }
      }
    } catch {
      setError('Error de conexión al cargar el carrito')
    } finally {
      setLoading(false)
    }
  }, [user, getValidToken])

  useEffect(() => {
    if (!user) return

    let isMounted = true
    const initCart = async () => {
      const token = await getValidToken()
      if (!token || !isMounted) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const res = await cartService.getActiveCart(token)
        if (!isMounted) return
        if (res.success && res.data) {
          setCart(res.data)
        } else {
          const initRes = await cartService.getOrCreateCart(token)
          if (!isMounted) return
          if (initRes.success && initRes.data) {
            setCart(initRes.data)
          }
        }
      } catch {
        if (isMounted) setError('Error al sincronizar el carrito')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initCart()

    return () => {
      isMounted = false
    }
  }, [user, getValidToken])

  const items = useMemo(() => cart?.items || [], [cart])

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + (item.quantity || 0), 0),
    [items]
  )

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + (Number(item.product_details?.price) || 0) * (item.quantity || 0),
        0
      ),
    [items]
  )

  const currentStoreId = useMemo(() => {
    if (items.length === 0) return null
    return items[0]?.product_details?.store || null
  }, [items])

  /**
   * Agrega un producto al carrito respetando la regla mono-tienda.
   */
  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      return { success: false, requireAuth: true, error: 'Debes iniciar sesión para comprar' }
    }

    // Validación de regla mono-tienda en frontend
    if (currentStoreId && product.store && currentStoreId !== product.store) {
      return {
        success: false,
        monoStoreConflict: true,
        currentStoreId,
        targetStoreId: product.store,
        error: 'El carrito ya contiene productos de otro comercio.',
      }
    }

    const token = await getValidToken()
    if (!token) {
      return { success: false, error: 'Sesión no válida o expirada' }
    }

    const cartId = cart.id || (await cartService.getOrCreateCart(token)).data?.id
    const res = await cartService.addItemToCart(
      { cartId, productId: product.id, quantity },
      token
    )

    if (res.success) {
      await refreshCart()
      return { success: true, data: res.data }
    }

    return { success: false, error: res.error }
  }

  /**
   * Modifica la cantidad de un ítem existente. Si quantity <= 0, lo elimina.
   */
  const updateQuantity = async (itemId, quantity) => {
    const token = await getValidToken()
    if (!token) return { success: false, error: 'No autenticado' }

    if (quantity <= 0) {
      return await removeItem(itemId)
    }

    const res = await cartService.updateItemQuantity(itemId, quantity, token)
    if (res.success) {
      await refreshCart()
      return { success: true }
    }
    return { success: false, error: res.error }
  }

  /**
   * Elimina un ítem específico del carrito.
   */
  const removeItem = async (itemId) => {
    const token = await getValidToken()
    if (!token) return { success: false, error: 'No autenticado' }

    const res = await cartService.removeItemFromCart(itemId, token)
    if (res.success) {
      await refreshCart()
      return { success: true }
    }
    return { success: false, error: res.error }
  }

  /**
   * Vacía el carrito completo.
   */
  const clearCart = async () => {
    const token = await getValidToken()
    if (!token) return { success: false, error: 'No autenticado' }

    const res = await cartService.clearCart(token)
    if (res.success) {
      await refreshCart()
      return { success: true }
    }
    return { success: false, error: res.error }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        totalAmount,
        currentStoreId,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
