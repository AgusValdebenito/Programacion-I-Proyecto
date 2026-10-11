import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import StoreDetail from '../StoreDetail'
import { storeService } from '../../services/storeService'
import { productService } from '../../services/productService'

const mockAddToCart = vi.fn()
const mockClearCart = vi.fn()

vi.mock('../../hooks/useCart', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    clearCart: mockClearCart,
  }),
}))

vi.mock('../../services/storeService', () => ({
  storeService: {
    getStoreById: vi.fn(),
  },
}))

vi.mock('../../services/productService', () => ({
  productService: {
    getProducts: vi.fn(),
  },
}))

describe('StoreDetail View Component (TP9 TDD)', () => {
  const mockStore = {
    id: 5,
    name: 'Crazy Burgers',
    description: 'Hamburguesas artesanales premium',
    image: null,
  }

  const mockProducts = [
    {
      id: 1,
      name: 'Crazy Burger Simple',
      description: 'Medallón 150g, cheddar y lechuga',
      price: '4200.00',
      stock: 20,
      is_available: true,
      store: 5,
    },
    {
      id: 2,
      name: 'Crazy Bacon Doble',
      description: 'Doble medallón y panceta',
      price: '5600.00',
      stock: 0,
      is_available: true,
      store: 5,
    },
  ]

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders loading spinner while fetching store and products', () => {
    storeService.getStoreById.mockReturnValue(new Promise(() => {}))
    productService.getProducts.mockReturnValue(new Promise(() => {}))

    render(
      <MemoryRouter initialEntries={['/tiendas/5']}>
        <Routes>
          <Route path="/tiendas/:id" element={<StoreDetail />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/cargando carta y menú del comercio/i)).toBeInTheDocument()
  })

  it('renders store header and products list when data is loaded successfully', async () => {
    storeService.getStoreById.mockResolvedValueOnce({ success: true, data: mockStore })
    productService.getProducts.mockResolvedValueOnce({ success: true, data: mockProducts })

    render(
      <MemoryRouter initialEntries={['/tiendas/5']}>
        <Routes>
          <Route path="/tiendas/:id" element={<StoreDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Crazy Burgers', level: 1 })).toBeInTheDocument()
      expect(screen.getByText('Hamburguesas artesanales premium')).toBeInTheDocument()
      expect(screen.getByText('Crazy Burger Simple')).toBeInTheDocument()
      expect(screen.getByText('Crazy Bacon Doble')).toBeInTheDocument()
    })
  })

  it('renders friendly empty state when the store has no products yet', async () => {
    storeService.getStoreById.mockResolvedValueOnce({ success: true, data: mockStore })
    productService.getProducts.mockResolvedValueOnce({ success: true, data: [] })

    render(
      <MemoryRouter initialEntries={['/tiendas/5']}>
        <Routes>
          <Route path="/tiendas/:id" element={<StoreDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/este comercio aún no tiene productos publicados/i)).toBeInTheDocument()
    })
  })

  it('renders error alert when store is not found or fails to load', async () => {
    storeService.getStoreById.mockResolvedValueOnce({ success: false, error: 'Tienda no encontrada' })
    productService.getProducts.mockResolvedValueOnce({ success: true, data: [] })

    render(
      <MemoryRouter initialEntries={['/tiendas/999']}>
        <Routes>
          <Route path="/tiendas/:id" element={<StoreDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Tienda no encontrada')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /volver al inicio/i })).toBeInTheDocument()
    })
  })

  it('adds product to cart and displays success message toast', async () => {
    storeService.getStoreById.mockResolvedValueOnce({ success: true, data: mockStore })
    productService.getProducts.mockResolvedValueOnce({ success: true, data: mockProducts })
    mockAddToCart.mockResolvedValueOnce({ success: true })

    render(
      <MemoryRouter initialEntries={['/tiendas/5']}>
        <Routes>
          <Route path="/tiendas/:id" element={<StoreDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Crazy Burger Simple')).toBeInTheDocument()
    })

    const addButtons = screen.getAllByRole('button', { name: /agregar/i })
    await act(async () => {
      fireEvent.click(addButtons[0])
    })

    expect(mockAddToCart).toHaveBeenCalledWith(mockProducts[0])
    await waitFor(() => {
      expect(screen.getByText(/se agregó "Crazy Burger Simple" al carrito/i)).toBeInTheDocument()
    })
  })

  it('displays mono-store conflict modal when attempting to add product from a different store', async () => {
    storeService.getStoreById.mockResolvedValueOnce({ success: true, data: mockStore })
    productService.getProducts.mockResolvedValueOnce({ success: true, data: mockProducts })
    mockAddToCart.mockResolvedValueOnce({
      success: false,
      monoStoreConflict: true,
      currentStoreId: 9,
    })

    render(
      <MemoryRouter initialEntries={['/tiendas/5']}>
        <Routes>
          <Route path="/tiendas/:id" element={<StoreDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Crazy Burger Simple')).toBeInTheDocument()
    })

    const addButtons = screen.getAllByRole('button', { name: /agregar/i })
    await act(async () => {
      fireEvent.click(addButtons[0])
    })

    await waitFor(() => {
      expect(screen.getByText(/cambiar de comercio/i)).toBeInTheDocument()
      expect(screen.getByText(/tu carrito ya contiene productos de otra tienda/i)).toBeInTheDocument()
    })
  })
})
