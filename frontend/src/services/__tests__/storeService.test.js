import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { storeService } from '../storeService'

describe('storeService (TP9 Service Layer & TDD)', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.clearAllMocks()
  })

  it('getStores fetches all stores successfully', async () => {
    const mockStores = [
      { id: 1, name: 'Burger Queen', description: 'Las mejores hamburguesas' },
      { id: 2, name: 'Pizza Planet', description: 'Pizzas al horno de barro' },
    ]

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStores,
    })

    const result = await storeService.getStores()

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/stores/'),
      expect.objectContaining({ method: 'GET' })
    )
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockStores)
  })

  it('getStoreById fetches a single store by ID', async () => {
    const mockStore = { id: 1, name: 'Burger Queen', description: 'Las mejores hamburguesas' }

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStore,
    })

    const result = await storeService.getStoreById(1)

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/stores/1/'),
      expect.objectContaining({ method: 'GET' })
    )
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockStore)
  })

  it('handles error response gracefully', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Tienda no encontrada' }),
    })

    const result = await storeService.getStoreById(999)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Tienda no encontrada')
  })
})
