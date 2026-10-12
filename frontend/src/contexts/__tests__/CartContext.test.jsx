import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { CartProvider, CartContext } from '../CartContext'
import { useContext } from 'react'
import { cartService } from '../../services/cartService'
import * as AuthHook from '../../hooks/useAuth'

vi.mock('../../services/cartService', () => ({
  cartService: {
    getActiveCart: vi.fn(),
    getOrCreateCart: vi.fn(),
    addItemToCart: vi.fn(),
    updateItemQuantity: vi.fn(),
    removeItemFromCart: vi.fn(),
    clearCart: vi.fn(),
    checkout: vi.fn(),
  },
}))

describe('CartContext & Provider (TP9 TDD)', () => {
  const mockUser = { id: 1, email: 'cliente@test.com' }
  const mockToken = 'mock-jwt-token'

  const mockProductStoreA = {
    id: 101,
    name: 'Burger Doble',
    price: '4000.00',
    store: 5,
    is_available: true,
    stock: 10,
  }

  const mockProductStoreB = {
    id: 201,
    name: 'Pizza Napolitana',
    price: '6000.00',
    store: 9,
    is_available: true,
    stock: 5,
  }

  const mockInitialCart = {
    id: 10,
    user: 1,
    items: [
      {
        id: 1,
        cart: 10,
        product: 101,
        quantity: 2,
        product_details: mockProductStoreA,
      },
    ],
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: mockUser,
      getValidToken: vi.fn().mockResolvedValue(mockToken),
    })
  })

  const useTestCart = () => useContext(CartContext)

  it('loads active cart for authenticated user and computes totals', async () => {
    cartService.getActiveCart.mockResolvedValueOnce({
      success: true,
      data: mockInitialCart,
    })

    const { result } = renderHook(() => useTestCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.items).toHaveLength(1)
    })

    expect(result.current.itemCount).toBe(2)
    expect(result.current.totalAmount).toBe(8000)
    expect(result.current.currentStoreId).toBe(5)
  })

  it('adds item to cart successfully when product is from same store', async () => {
    cartService.getActiveCart.mockResolvedValueOnce({
      success: true,
      data: mockInitialCart,
    })
    cartService.addItemToCart.mockResolvedValueOnce({
      success: true,
      data: { id: 2, quantity: 1 },
    })
    cartService.getActiveCart.mockResolvedValueOnce({
      success: true,
      data: {
        ...mockInitialCart,
        items: [
          ...mockInitialCart.items,
          { id: 2, product: 102, quantity: 1, product_details: { ...mockProductStoreA, id: 102, price: '3000.00' } },
        ],
      },
    })

    const { result } = renderHook(() => useTestCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    let response
    await act(async () => {
      response = await result.current.addToCart({ ...mockProductStoreA, id: 102 }, 1)
    })

    expect(response.success).toBe(true)
    expect(cartService.addItemToCart).toHaveBeenCalledWith(
      { cartId: 10, productId: 102, quantity: 1 },
      mockToken
    )
    expect(result.current.itemCount).toBe(3)
  })

  it('detects mono-store conflict when attempting to add product from a different store', async () => {
    cartService.getActiveCart.mockResolvedValueOnce({
      success: true,
      data: mockInitialCart,
    })

    const { result } = renderHook(() => useTestCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    let response
    await act(async () => {
      response = await result.current.addToCart(mockProductStoreB, 1)
    })

    expect(response.success).toBe(false)
    expect(response.monoStoreConflict).toBe(true)
    expect(response.currentStoreId).toBe(5)
    expect(response.targetStoreId).toBe(9)
    expect(cartService.addItemToCart).not.toHaveBeenCalled()
  })

  it('updates item quantity and removes item when quantity reaches 0', async () => {
    cartService.getActiveCart.mockResolvedValueOnce({
      success: true,
      data: mockInitialCart,
    })
    cartService.updateItemQuantity.mockResolvedValueOnce({ success: true })
    cartService.getActiveCart.mockResolvedValueOnce({
      success: true,
      data: {
        ...mockInitialCart,
        items: [{ ...mockInitialCart.items[0], quantity: 3 }],
      },
    })

    const { result } = renderHook(() => useTestCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.updateQuantity(1, 3)
    })

    expect(cartService.updateItemQuantity).toHaveBeenCalledWith(1, 3, mockToken)
    expect(result.current.itemCount).toBe(3)

    // Test decrement to 0 -> should call removeItemFromCart
    cartService.removeItemFromCart.mockResolvedValueOnce({ success: true })
    cartService.getActiveCart.mockResolvedValueOnce({
      success: true,
      data: { ...mockInitialCart, items: [] },
    })

    await act(async () => {
      await result.current.updateQuantity(1, 0)
    })

    expect(cartService.removeItemFromCart).toHaveBeenCalledWith(1, mockToken)
  })

  it('clears cart and resets store restriction', async () => {
    cartService.getActiveCart.mockResolvedValueOnce({
      success: true,
      data: mockInitialCart,
    })
    cartService.clearCart.mockResolvedValueOnce({ success: true })
    cartService.getActiveCart.mockResolvedValueOnce({
      success: true,
      data: { id: 10, user: 1, items: [] },
    })

    const { result } = renderHook(() => useTestCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.clearCart()
    })

    expect(cartService.clearCart).toHaveBeenCalledWith(mockToken)
    expect(result.current.items).toHaveLength(0)
    expect(result.current.currentStoreId).toBeNull()
  })

  it('checkout calls cartService.checkout and refreshes cart', async () => {
    const mockOrder = { id: 77, total: '8000.00', status: 'pending' }
    cartService.getActiveCart.mockResolvedValueOnce({
      success: true,
      data: mockInitialCart,
    })
    cartService.checkout.mockResolvedValueOnce({ success: true, data: mockOrder })
    cartService.getActiveCart.mockResolvedValueOnce({
      success: true,
      data: { id: 10, user: 1, items: [] },
    })

    const { result } = renderHook(() => useTestCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    let checkoutResult
    await act(async () => {
      checkoutResult = await result.current.checkout()
    })

    expect(cartService.checkout).toHaveBeenCalledWith(mockToken)
    expect(checkoutResult.success).toBe(true)
    expect(checkoutResult.data).toEqual(mockOrder)
    expect(result.current.items).toHaveLength(0)
  })
})
