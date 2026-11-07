import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StoreKpis from '../StoreKpis'

describe('StoreKpis Component', () => {
  it('renders null when stats is not provided', () => {
    const { container } = render(<StoreKpis stats={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders all four executive KPI cards with proper formatting', () => {
    const stats = {
      totalProd: 12,
      availableProd: 10,
      pendingOrders: 3,
      totalOrders: 45,
      totalRevenue: 15420.5,
    }

    render(<StoreKpis stats={stats} />)

    expect(screen.getByText('Platos Publicados')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('10 disponibles')).toBeInTheDocument()

    expect(screen.getByText('Pedidos Pendientes')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    expect(screen.getByText('Total de Pedidos')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()

    expect(screen.getByText('Ventas Entregadas')).toBeInTheDocument()
    expect(screen.getByText('$15420.50')).toBeInTheDocument()
  })
})
