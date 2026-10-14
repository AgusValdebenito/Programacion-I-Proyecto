import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PanelTienda from '../PanelTienda'
import { useAuth } from '../../hooks/useAuth'
import { storeService } from '../../services/storeService'
import { productService } from '../../services/productService'
import { orderService } from '../../services/orderService'

vi.mock('../../hooks/useAuth')
vi.mock('../../services/storeService')
vi.mock('../../services/productService')
vi.mock('../../services/orderService')

describe('PanelTienda View (TP9 - Milestone 3 TDD: Issues #19, #20, #21)', () => {
  const mockUser = { id: 10, email: 'chef@foodrush.com', name: 'Chef Mario', role: 'vendedor' }
  const mockToken = 'mock-jwt-token'

  const getTokenMock = vi.fn().mockReturnValue('mock-jwt-token')

  beforeEach(() => {
    vi.clearAllMocks()
    getTokenMock.mockReturnValue(mockToken)
    useAuth.mockReturnValue({
      user: mockUser,
      getToken: getTokenMock,
      updateUser: vi.fn(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders onboarding form when vendor has no store (Issue #19)', async () => {
    storeService.getMyStore.mockResolvedValueOnce({
      success: false,
      error: 'No se encontró tienda',
    })

    render(
      <MemoryRouter>
        <PanelTienda />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/¡abrí tu tienda en foodrush!/i)).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/nombre del comercio/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /abrir mi tienda ahora/i })).toBeInTheDocument()
  })

  it('allows user to create a store from onboarding (Issue #19)', async () => {
    storeService.getMyStore.mockResolvedValueOnce({
      success: false,
    })
    storeService.createStore.mockResolvedValueOnce({
      success: true,
      data: { id: 7, name: 'La Trattoria', description: 'Pastas caseras', image: '' },
    })
    productService.getProducts.mockResolvedValueOnce({ success: true, data: [] })
    orderService.getStoreOrders.mockResolvedValueOnce({ success: true, data: [] })

    const updateUserMock = vi.fn()
    useAuth.mockReturnValue({
      user: mockUser,
      getToken: getTokenMock,
      updateUser: updateUserMock,
    })

    render(
      <MemoryRouter>
        <PanelTienda />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/nombre del comercio/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/nombre del comercio/i), {
      target: { value: 'La Trattoria' },
    })
    fireEvent.change(screen.getByLabelText(/descripción/i), {
      target: { value: 'Pastas caseras' },
    })

    fireEvent.click(screen.getByRole('button', { name: /abrir mi tienda ahora/i }))

    await waitFor(() => {
      expect(storeService.createStore).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'La Trattoria', description: 'Pastas caseras' }),
        mockToken
      )
      expect(updateUserMock).toHaveBeenCalledWith({ role: 'vendedor' })
    })
  })

  it('renders active store dashboard with KPI metrics (Issue #19)', async () => {
    const mockStore = {
      id: 7,
      name: 'La Trattoria',
      description: 'Pastas caseras',
      image: '/images/trattoria.jpg',
    }
    storeService.getMyStore.mockResolvedValue({
      success: true,
      data: mockStore,
    })
    productService.getProducts.mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: 'Ravioles', price: '2500.00', stock: 10, is_available: true },
        { id: 2, name: 'Lasagna', price: '3200.00', stock: 0, is_available: false },
      ],
    })
    orderService.getStoreOrders.mockResolvedValue({
      success: true,
      data: [
        { id: 101, status: 'pending', total: '2500.00' },
        { id: 102, status: 'delivered', total: '3200.00' },
      ],
    })

    render(
      <MemoryRouter>
        <PanelTienda />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('La Trattoria')).toBeInTheDocument()
      expect(screen.getByText(/pastas caseras/i)).toBeInTheDocument()
      expect(screen.getByText(/tienda activa/i)).toBeInTheDocument()
    })

    // Check KPIs in Resumen tab
    expect(screen.getByText('Platos Publicados')).toBeInTheDocument()
    expect(screen.getByText('Pedidos Pendientes')).toBeInTheDocument()
  })

  it('manages products, toggles availability and deletes a product (Issue #20)', async () => {
    const mockStore = { id: 7, name: 'La Trattoria' }
    storeService.getMyStore.mockResolvedValue({ success: true, data: mockStore })
    productService.getProducts.mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: 'Ravioles', price: '2500.00', stock: 10, is_available: true },
      ],
    })
    orderService.getStoreOrders.mockResolvedValue({ success: true, data: [] })
    productService.updateProduct.mockResolvedValue({ success: true })
    productService.deleteProduct.mockResolvedValue({ success: true })

    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <MemoryRouter>
        <PanelTienda />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('La Trattoria')).toBeInTheDocument()
    })

    // Switch to Menú tab
    fireEvent.click(screen.getByRole('button', { name: /menú y productos/i }))

    await waitFor(() => {
      expect(screen.getByText('Ravioles')).toBeInTheDocument()
      expect(screen.getByText('Disponible')).toBeInTheDocument()
    })

    // Toggle availability
    const switchInput = screen.getByRole('switch')
    fireEvent.click(switchInput)

    await waitFor(() => {
      expect(productService.updateProduct).toHaveBeenCalledWith(
        1,
        { is_available: false },
        mockToken
      )
    })

    // Delete product
    const deleteButton = screen.getByTitle('Eliminar plato')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(productService.deleteProduct).toHaveBeenCalledWith(1, mockToken)
    })
  })

  it('adds a new product via modal (Issue #20)', async () => {
    const mockStore = { id: 7, name: 'La Trattoria' }
    storeService.getMyStore.mockResolvedValue({ success: true, data: mockStore })
    productService.getProducts.mockResolvedValue({ success: true, data: [] })
    orderService.getStoreOrders.mockResolvedValue({ success: true, data: [] })

    productService.createProduct.mockResolvedValue({
      success: true,
      data: { id: 50, name: 'Sorrentinos', price: '2800.00', stock: 15, is_available: true },
    })

    render(
      <MemoryRouter>
        <PanelTienda />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('La Trattoria')).toBeInTheDocument()
    })

    // Switch to Menú tab
    fireEvent.click(screen.getByRole('button', { name: /menú y productos/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nuevo producto/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /nuevo producto/i }))

    // Fill Product modal
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/nombre del producto/i), {
      target: { value: 'Sorrentinos' },
    })
    fireEvent.change(screen.getByLabelText(/precio/i), {
      target: { value: '2800' },
    })
    fireEvent.change(screen.getByLabelText(/stock disponible/i), {
      target: { value: '15' },
    })

    fireEvent.click(screen.getByRole('button', { name: /crear producto/i }))

    await waitFor(() => {
      expect(productService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sorrentinos',
          price: '2800.00',
          stock: 15,
          store: 7,
        }),
        mockToken
      )
    })
  })

  it('monitors kitchen orders and transitions statuses (Issue #21)', async () => {
    const mockStore = { id: 7, name: 'La Trattoria' }
    storeService.getMyStore.mockResolvedValue({ success: true, data: mockStore })
    productService.getProducts.mockResolvedValue({ success: true, data: [] })
    orderService.getStoreOrders.mockResolvedValue({
      success: true,
      data: [
        {
          id: 201,
          status: 'pending',
          total: '4500.00',
          created_at: '2026-10-12T20:00:00Z',
          items: [{ product: 1, product_name: 'Fideos Caseros', quantity: 2, unit_price: '2250.00' }],
        },
      ],
    })
    orderService.updateOrderStatus.mockResolvedValue({
      success: true,
      data: { id: 201, status: 'preparing' },
    })

    render(
      <MemoryRouter>
        <PanelTienda />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('La Trattoria')).toBeInTheDocument()
    })

    // Switch to Pedidos tab
    fireEvent.click(screen.getByRole('button', { name: /monitor de pedidos/i }))

    await waitFor(() => {
      expect(screen.getByText('Pedido #201')).toBeInTheDocument()
      expect(screen.getByText('Aceptar y Preparar')).toBeInTheDocument()
      expect(screen.getByText('Rechazar')).toBeInTheDocument()
    })

    // Advance status to preparing
    fireEvent.click(screen.getByRole('button', { name: /aceptar y preparar/i }))

    await waitFor(() => {
      expect(orderService.updateOrderStatus).toHaveBeenCalledWith(201, 'preparing', mockToken)
    })
  })

  it('displays error banner with retry button when loading products fails in menu tab', async () => {
    const mockStore = { id: 7, name: 'La Trattoria' }
    storeService.getMyStore.mockResolvedValue({ success: true, data: mockStore })
    productService.getProducts
      .mockResolvedValueOnce({ success: false, error: 'Fallo al obtener platos' })
      .mockResolvedValueOnce({
        success: true,
        data: [{ id: 1, name: 'Fideos Caseros', price: '2250.00', stock: 10, is_available: true }],
      })
    orderService.getStoreOrders.mockResolvedValue({ success: true, data: [] })

    render(
      <MemoryRouter>
        <PanelTienda />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('La Trattoria')).toBeInTheDocument()
    })

    // Switch to Menu tab
    fireEvent.click(screen.getByRole('button', { name: /menú y productos/i }))

    await waitFor(() => {
      expect(screen.getByText(/error al cargar el catálogo:/i)).toBeInTheDocument()
      expect(screen.getByText(/fallo al obtener platos/i)).toBeInTheDocument()
    })

    // Click retry
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))

    await waitFor(() => {
      expect(screen.getByText('Fideos Caseros')).toBeInTheDocument()
    })
  })

  it('displays error banner with retry button when loading orders fails in pedidos tab', async () => {
    const mockStore = { id: 7, name: 'La Trattoria' }
    storeService.getMyStore.mockResolvedValue({ success: true, data: mockStore })
    productService.getProducts.mockResolvedValue({ success: true, data: [] })
    orderService.getStoreOrders
      .mockResolvedValueOnce({ success: false, error: 'Fallo al obtener comandas' })
      .mockResolvedValueOnce({
        success: true,
        data: [{ id: 301, status: 'pending', total: '1500.00', items: [] }],
      })

    render(
      <MemoryRouter>
        <PanelTienda />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('La Trattoria')).toBeInTheDocument()
    })

    // Switch to Pedidos tab
    fireEvent.click(screen.getByRole('button', { name: /monitor de pedidos/i }))

    await waitFor(() => {
      expect(screen.getByText(/error al cargar pedidos:/i)).toBeInTheDocument()
      expect(screen.getByText(/fallo al obtener comandas/i)).toBeInTheDocument()
    })

    // Click retry
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))

    await waitFor(() => {
      expect(screen.getByText('Pedido #301')).toBeInTheDocument()
    })
  })

  it('allows kitchen to reject order with reason and reactive out-of-stock product pause (Issue #22)', async () => {
    const mockStore = { id: 7, name: 'La Trattoria' }
    const mockProducts = [
      { id: 10, name: 'Ravioles con Salsa', price: '2500.00', stock: 5, is_available: true, store: 7 },
    ]
    const mockOrder = {
      id: 202,
      store: 7,
      status: 'pending',
      total: '5000.00',
      items: [{ id: 1, product: 10, product_name: 'Ravioles con Salsa', quantity: 2, price: '2500.00' }],
    }

    storeService.getMyStore.mockResolvedValue({ success: true, data: mockStore })
    productService.getProducts.mockResolvedValue({ success: true, data: mockProducts })
    orderService.getStoreOrders.mockResolvedValue({
      success: true,
      data: [mockOrder],
    })
    orderService.updateOrderStatus.mockResolvedValue({
      success: true,
      data: {
        id: 202,
        status: 'cancelled',
        cancellation_reason: 'Falta de stock / ingrediente agotado',
        cancelled_product: 10,
        cancelled_product_name: 'Ravioles con Salsa',
      },
    })

    render(
      <MemoryRouter>
        <PanelTienda />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('La Trattoria')).toBeInTheDocument()
    })

    // Switch to Pedidos tab
    fireEvent.click(screen.getByRole('button', { name: /monitor de pedidos/i }))

    await waitFor(() => {
      expect(screen.getByText('Pedido #202')).toBeInTheDocument()
      expect(screen.getByText('Rechazar')).toBeInTheDocument()
    })

    // Click Rechazar to open modal
    fireEvent.click(screen.getByRole('button', { name: /rechazar/i }))

    expect(screen.getByText(/rechazar pedido #202/i)).toBeInTheDocument()

    // Select reason "Falta de insumos / Producto agotado"
    const reasonSelect = screen.getByLabelText(/motivo de rechazo/i)
    fireEvent.change(reasonSelect, { target: { value: 'Falta de insumos / Producto agotado' } })

    // Select product dropdown should now appear
    const productSelect = screen.getByLabelText(/plato\/producto agotado/i)
    fireEvent.change(productSelect, { target: { value: '10' } })

    // Confirm rejection
    fireEvent.click(screen.getByRole('button', { name: /confirmar rechazo/i }))

    await waitFor(() => {
      expect(orderService.updateOrderStatus).toHaveBeenCalledWith(202, 'cancelled', mockToken, {
        cancellation_reason: 'Falta de insumos / Producto agotado',
        cancelled_product: 10,
      })
    })
  })
})

