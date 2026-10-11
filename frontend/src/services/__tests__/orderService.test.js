import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { orderService } from '../orderService'

describe('orderService (TP9 Service Layer & TDD)', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.clearAllMocks()
  })

  it('getOrders fetches orders with authorization token', async () => {
    const mockOrders = [
      { id: 1, total: '3500.00', status: 'pending', created_at: '2026-10-10T10:00:00Z' },
    ]
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    })

    const result = await orderService.getOrders('mock-token')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/orders/'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      })
    )
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockOrders)
  })

  it('createOrder sends POST request to /orders/', async () => {
    const payload = { store: 1, total: '3500.00', status: 'pending' }
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 45, ...payload }),
    })

    const result = await orderService.createOrder(payload, 'mock-token')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/orders/'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload),
      })
    )
    expect(result.success).toBe(true)
    expect(result.data.id).toBe(45)
  })

  it('updateOrderStatus sends PATCH request to transition order status', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 45, status: 'preparing' }),
    })

    const result = await orderService.updateOrderStatus(45, 'preparing', 'mock-token')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/orders/45/'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ status: 'preparing' }),
      })
    )
    expect(result.success).toBe(true)
  })

  it('handles error response gracefully', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'Transición de estado inválida' }),
    })

    const result = await orderService.updateOrderStatus(45, 'delivered', 'mock-token')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Transición de estado inválida')
  })
})
