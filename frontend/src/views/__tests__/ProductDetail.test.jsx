import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProductDetail from '../ProductDetail'
import { productService } from '../../services/productService'
import { storeService } from '../../services/storeService'

const mockAddToCart = vi.fn()
const mockClearCart = vi.fn()

vi.mock('../../hooks/useCart', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    clearCart: mockClearCart,
  }),
}))

vi.mock('../../services/productService', () => ({
  productService: {
    getProductById: vi.fn(),
  },
}))

vi.mock('../../services/storeService', () => ({
  storeService: {
    getStoreById: vi.fn(),
  },
}))

describe('ProductDetail View Component (TP9 TDD)', () => {
  const mockProduct = {
    id: 10,
    name: 'Crazy Bacon Doble',
    description: 'Doble carne 150g con queso cheddar y panceta crocante.',
    price: '6500.00',
    stock: 8,
    is_available: true,
    store: 2,
    image: null,
  }

  const mockStore = {
    id: 2,
    name: 'Crazy Burgers',
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    mockAddToCart.mockReset()
    mockClearCart.mockReset()
  })

  it('renders loading spinner while fetching product', () => {
    productService.getProductById.mockReturnValue(new Promise(() => {}))
    render(
      <MemoryRouter initialEntries={['/productos/10']}>
        <Routes>
          <Route path="/productos/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Cargando detalles del producto...')).toBeInTheDocument()
  })

  it('renders error state when product does not exist', async () => {
    productService.getProductById.mockResolvedValue({
      success: false,
      error: 'Producto no encontrado',
    })

    render(
      <MemoryRouter initialEntries={['/productos/999']}>
        <Routes>
          <Route path="/productos/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Producto no encontrado')).toBeInTheDocument()
    })
  })

  it('renders product details and store link when loaded successfully', async () => {
    productService.getProductById.mockResolvedValue({
      success: true,
      data: mockProduct,
    })
    storeService.getStoreById.mockResolvedValue({
      success: true,
      data: mockStore,
    })

    render(
      <MemoryRouter initialEntries={['/productos/10']}>
        <Routes>
          <Route path="/productos/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Crazy Bacon Doble' })).toBeInTheDocument()
    })

    expect(screen.getByText(/Doble carne 150g/)).toBeInTheDocument()
    expect(screen.getAllByText('Crazy Burgers').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Stock disponible/)).toBeInTheDocument()
  })

  it('allows incrementing and decrementing quantity within limits', async () => {
    productService.getProductById.mockResolvedValue({
      success: true,
      data: mockProduct,
    })
    storeService.getStoreById.mockResolvedValue({
      success: true,
      data: mockStore,
    })

    render(
      <MemoryRouter initialEntries={['/productos/10']}>
        <Routes>
          <Route path="/productos/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Crazy Bacon Doble' })).toBeInTheDocument()
    })

    const incBtn = screen.getByRole('button', { name: 'Aumentar cantidad' })
    const decBtn = screen.getByRole('button', { name: 'Disminuir cantidad' })

    expect(screen.getByText('1')).toBeInTheDocument()
    fireEvent.click(incBtn)
    expect(screen.getByText('2')).toBeInTheDocument()
    fireEvent.click(decBtn)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('calls addToCart with product and selected quantity', async () => {
    productService.getProductById.mockResolvedValue({
      success: true,
      data: mockProduct,
    })
    storeService.getStoreById.mockResolvedValue({
      success: true,
      data: mockStore,
    })
    mockAddToCart.mockResolvedValue({ success: true })

    render(
      <MemoryRouter initialEntries={['/productos/10']}>
        <Routes>
          <Route path="/productos/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Crazy Bacon Doble' })).toBeInTheDocument()
    })

    const addBtn = screen.getByRole('button', { name: /Agregar al carrito/i })
    await act(async () => {
      fireEvent.click(addBtn)
    })

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1)
  })
})
