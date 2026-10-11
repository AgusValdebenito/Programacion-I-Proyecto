import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { productService } from '../productService'

describe('productService (TP9 Service Layer & TDD)', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.clearAllMocks()
  })

  it('getProducts fetches all products successfully', async () => {
    const mockProducts = [
      { id: 1, name: 'Hamburguesa FoodRush', price: '1200.00', is_available: true },
      { id: 2, name: 'Pizza Muzzarella', price: '1800.00', is_available: true },
    ]

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    })

    const result = await productService.getProducts()

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/products/'),
      expect.objectContaining({ method: 'GET' })
    )
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockProducts)
  })

  it('getProducts appends query parameters for search and store', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    await productService.getProducts({ search: 'pizza', store: 5 })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/products\/\?.*search=pizza.*store=5/),
      expect.any(Object)
    )
  })

  it('getProductById fetches a single product by ID', async () => {
    const mockProduct = { id: 10, name: 'Lomito Completo', price: '2500.00' }
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    const result = await productService.getProductById(10)

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/products/10/'),
      expect.objectContaining({ method: 'GET' })
    )
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockProduct)
  })

  it('createProduct sends POST request with Authorization header and payload', async () => {
    const newProduct = { name: 'Empanada Criolla', price: '300.00', store: 1 }
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 99, ...newProduct }),
    })

    const result = await productService.createProduct(newProduct, 'mock-jwt-token')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/products/'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(newProduct),
      })
    )
    expect(result.success).toBe(true)
    expect(result.data.id).toBe(99)
  })

  it('updateProduct sends PATCH request with Authorization header', async () => {
    const patchData = { price: '350.00' }
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 99, price: '350.00' }),
    })

    const result = await productService.updateProduct(99, patchData, 'mock-jwt-token')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/products/99/'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(patchData),
      })
    )
    expect(result.success).toBe(true)
  })

  it('deleteProduct sends DELETE request with Authorization header', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    })

    const result = await productService.deleteProduct(99, 'mock-jwt-token')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/products/99/'),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token',
        }),
      })
    )
    expect(result.success).toBe(true)
  })

  it('handles error response gracefully', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'No encontrado' }),
    })

    const result = await productService.getProductById(999)

    expect(result.success).toBe(false)
    expect(result.error).toBe('No encontrado')
  })
})
