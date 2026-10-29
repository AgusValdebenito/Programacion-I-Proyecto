import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ModerationPanel from '../ModerationPanel'
import { storeService } from '../../services/storeService'
import { productService } from '../../services/productService'
import * as AuthHook from '../../hooks/useAuth'

vi.mock('../../services/storeService', () => ({
  storeService: {
    getStores: vi.fn(),
    toggleActive: vi.fn(),
    deleteStore: vi.fn(),
  },
}))

vi.mock('../../services/productService', () => ({
  productService: {
    getProducts: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}))

describe('ModerationPanel View Component (Milestone 5 - Issue #26)', () => {
  const mockStores = [
    {
      id: 1,
      owner: 10,
      name: 'La Trattoria',
      description: 'Pastas artesanales y risottos',
      is_active: true,
      image: null,
    },
    {
      id: 2,
      owner: 20,
      name: 'Sushi Bar Express',
      description: 'Rolls y sashimi fresco',
      is_active: false,
      image: null,
    },
  ]

  const mockProducts = [
    {
      id: 101,
      store: 1,
      name: 'Sorrentinos de Jamon y Queso',
      description: 'Con salsa cuatro quesos',
      price: '1800.00',
      is_available: true,
      stock: 15,
      track_stock: true,
      image: null,
    },
    {
      id: 102,
      store: 2,
      name: 'Combo Roll 20 Piezas',
      description: 'Salmon y palta',
      price: '4500.00',
      is_available: false,
      stock: 0,
      track_stock: false,
      image: null,
    },
  ]

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 99, role: 'admin', is_staff: true, name: 'Admin Supremo' },
      getToken: () => 'fake-jwt-token',
    })
    storeService.getStores.mockResolvedValue({ success: true, data: mockStores })
    productService.getProducts.mockResolvedValue({ success: true, data: mockProducts })
  })

  it('renders moderation metrics, stores table, and action buttons', async () => {
    render(
      <MemoryRouter>
        <ModerationPanel />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('La Trattoria')).toBeInTheDocument()
      expect(screen.getByText('Sushi Bar Express')).toBeInTheDocument()
    })

    expect(screen.getByText('Panel de Moderación Admin')).toBeInTheDocument()
    expect(screen.getByText(/Role: Admin/i)).toBeInTheDocument()
    expect(screen.getByText('Activa')).toBeInTheDocument()
    expect(screen.getByText('Suspendida')).toBeInTheDocument()
  })

  it('allows admin to suspend an active store and records it in audit log', async () => {
    storeService.toggleActive.mockResolvedValueOnce({
      success: true,
      data: { ...mockStores[0], is_active: false },
    })

    render(
      <MemoryRouter>
        <ModerationPanel />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('La Trattoria')).toBeInTheDocument()
    })

    const suspendBtn = screen.getByRole('button', { name: /suspender/i })
    fireEvent.click(suspendBtn)

    await waitFor(() => {
      expect(storeService.toggleActive).toHaveBeenCalledWith(1, 'fake-jwt-token')
      expect(screen.getByText(/fue suspendida preventivamente/i)).toBeInTheDocument()
    })

    // Cambiar a la pestaña de auditoría
    const auditTabBtn = screen.getByRole('button', { name: /auditoría/i })
    fireEvent.click(auditTabBtn)

    expect(screen.getByText(/SUSPENDER_TIENDA/i)).toBeInTheDocument()
    expect(screen.getByText('La Trattoria')).toBeInTheDocument()
  })

  it('allows admin to pause an active product from products tab', async () => {
    productService.updateProduct.mockResolvedValueOnce({
      success: true,
      data: { ...mockProducts[0], is_available: false },
    })

    render(
      <MemoryRouter>
        <ModerationPanel />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('La Trattoria')).toBeInTheDocument()
    })

    const productsTabBtn = screen.getByRole('button', { name: /productos/i })
    fireEvent.click(productsTabBtn)

    await waitFor(() => {
      expect(screen.getByText('Sorrentinos de Jamon y Queso')).toBeInTheDocument()
    })

    const pauseBtn = screen.getByRole('button', { name: /pausar/i })
    fireEvent.click(pauseBtn)

    await waitFor(() => {
      expect(productService.updateProduct).toHaveBeenCalledWith(
        101,
        { is_available: false },
        'fake-jwt-token'
      )
      expect(screen.getByText(/fue pausado preventivamente/i)).toBeInTheDocument()
    })
  })

  it('filters stores by search text in the moderation search input', async () => {
    render(
      <MemoryRouter>
        <ModerationPanel />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('La Trattoria')).toBeInTheDocument()
      expect(screen.getByText('Sushi Bar Express')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/buscar en tiendas/i)
    fireEvent.change(searchInput, { target: { value: 'Sushi' } })

    expect(screen.getByText('Sushi Bar Express')).toBeInTheDocument()
    expect(screen.queryByText('La Trattoria')).not.toBeInTheDocument()
  })
})
