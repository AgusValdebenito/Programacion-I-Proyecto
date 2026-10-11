import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cartService } from '../cartService'

describe('cartService (TP9 Service Layer & TDD)', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.clearAllMocks()
  })

  it('getOrCreateCart requests active cart with token', async () => {
    const mockCart = { id: 10, user: 1, items: [] }
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCart,
    })

    const result = await cartService.getOrCreateCart('mock-token')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/carts/'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      })
    )
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockCart)
  })

  it('addItemToCart sends item payload to /cart-items/', async () => {
    const mockItem = { id: 5, cart: 10, product: 2, quantity: 1 }
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItem,
    })

    const result = await cartService.addItemToCart(
      { cartId: 10, productId: 2, quantity: 1 },
      'mock-token'
    )

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cart-items/'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ cart: 10, product: 2, quantity: 1 }),
      })
    )
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockItem)
  })

  it('updateItemQuantity sends PATCH request to /cart-items/:id/', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 5, quantity: 3 }),
    })

    const result = await cartService.updateItemQuantity(5, 3, 'mock-token')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cart-items/5/'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ quantity: 3 }),
      })
    )
    expect(result.success).toBe(true)
  })

  it('removeItemFromCart sends DELETE request to /cart-items/:id/', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    })

    const result = await cartService.removeItemFromCart(5, 'mock-token')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cart-items/5/'),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      })
    )
    expect(result.success).toBe(true)
  })

  it('handles errors cleanly', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'No se pueden mezclar productos de distintas tiendas' }),
    })

    const result = await cartService.addItemToCart(
      { cartId: 10, productId: 8, quantity: 1 },
      'mock-token'
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('No se pueden mezclar productos de distintas tiendas')
  })

  it('getActiveCart fetches /carts/active/ with token', async () => {
    const mockCart = { id: 10, items: [] }
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCart,
    })

    const result = await cartService.getActiveCart('mock-token')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/carts/active/'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      })
    )
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockCart)
  })

  it('clearCart sends DELETE to /carts/clear/', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ detail: 'Carrito vaciado exitosamente.' }),
    })

    const result = await cartService.clearCart('mock-token')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/carts/clear/'),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      })
    )
    expect(result.success).toBe(true)
  })
})
