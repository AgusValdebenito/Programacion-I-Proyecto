import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StoreOrderMonitor from '../StoreOrderMonitor'

describe('StoreOrderMonitor Component', () => {
  const mockOrders = [
    {
      id: 101,
      status: 'pending',
      created_at: '2026-11-06T20:00:00Z',
      total: '4500.00',
      items: [{ quantity: 2, product_name: 'Empanadas', unit_price: '2250.00' }],
    },
    {
      id: 102,
      status: 'preparing',
      created_at: '2026-11-06T20:10:00Z',
      total: '3000.00',
      items: [{ quantity: 1, product_name: 'Pizza', unit_price: '3000.00' }],
    },
    {
      id: 103,
      status: 'delivering',
      created_at: '2026-11-06T20:20:00Z',
      total: '1500.00',
      items: [{ quantity: 1, product_name: 'Gaseosa', unit_price: '1500.00' }],
    },
  ]

  const defaultProps = {
    orders: mockOrders,
    filteredOrders: mockOrders,
    loadingOrders: false,
    ordersError: null,
    orderFilter: 'todos',
    onFilterChange: vi.fn(),
    onRefresh: vi.fn(),
    updatingOrderId: null,
    onOpenRejectModal: vi.fn(),
    onTransitionOrder: vi.fn(),
  }

  it('renders order cards with status badges and details', () => {
    render(<StoreOrderMonitor {...defaultProps} />)

    expect(screen.getByText('Monitor de Pedidos y Cocina')).toBeInTheDocument()
    expect(screen.getByText('Pedido #101')).toBeInTheDocument()
    expect(screen.getByText('Pedido #102')).toBeInTheDocument()
    expect(screen.getByText('Pedido #103')).toBeInTheDocument()
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('En Preparación').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('En Reparto').length).toBeGreaterThanOrEqual(1)
  })

  it('triggers transition to "preparing" when "Aceptar y Preparar" is clicked', () => {
    const onTransitionOrder = vi.fn()
    render(<StoreOrderMonitor {...defaultProps} onTransitionOrder={onTransitionOrder} />)

    const acceptBtn = screen.getByRole('button', { name: /aceptar y preparar/i })
    fireEvent.click(acceptBtn)

    expect(onTransitionOrder).toHaveBeenCalledWith(101, 'preparing')
  })

  it('triggers onOpenRejectModal when "Rechazar" is clicked', () => {
    const onOpenRejectModal = vi.fn()
    render(<StoreOrderMonitor {...defaultProps} onOpenRejectModal={onOpenRejectModal} />)

    const rejectBtn = screen.getByRole('button', { name: /rechazar/i })
    fireEvent.click(rejectBtn)

    expect(onOpenRejectModal).toHaveBeenCalledWith(mockOrders[0])
  })

  it('calls onFilterChange when a filter pill is clicked', () => {
    const onFilterChange = vi.fn()
    render(<StoreOrderMonitor {...defaultProps} onFilterChange={onFilterChange} />)

    const pendingFilter = screen.getByRole('button', { name: /pendientes/i })
    fireEvent.click(pendingFilter)

    expect(onFilterChange).toHaveBeenCalledWith('pending')
  })
})
