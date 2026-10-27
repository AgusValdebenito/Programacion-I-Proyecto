import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Profile from '../Profile'
import * as AuthHook from '../../hooks/useAuth'
import * as AddressHook from '../../hooks/useAddress'
import { orderService } from '../../services/orderService'
import { authService } from '../../services/authService'

vi.mock('../../services/orderService', () => ({
  orderService: {
    getOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
    rateOrder: vi.fn(),
  },
}))

vi.mock('../../services/authService', () => ({
  authService: {
    updateProfile: vi.fn(),
  },
}))

describe('Profile View & Components (TP9 TDD - Issue #18)', () => {
  const mockUser = {
    id: 1,
    name: 'Juan Perez',
    email: 'juan@example.com',
    phone: '1144556677',
    role: 'cliente',
  }

  const mockAddresses = [
    { id: 'addr-1', label: 'Casa', address: 'Av. Corrientes 1234, 4B', isDefault: true },
    { id: 'addr-2', label: 'Hotel', address: 'Av. Libertador 500', isDefault: false },
  ]

  const mockOrders = [
    {
      id: 101,
      store: 5,
      store_name: 'Crazy Burgers',
      total: '8400.00',
      status: 'pending',
      created_at: '2026-10-11T20:00:00Z',
      items: [
        { id: 1, product_name: 'Crazy Burger Simple', quantity: 2, unit_price: '4200.00' },
      ],
    },
    {
      id: 102,
      store: 9,
      store_name: 'Pizza Planet',
      total: '6500.00',
      status: 'delivered',
      created_at: '2026-10-10T19:00:00Z',
      items: [
        { id: 2, product_name: 'Pizza Muzzarella', quantity: 1, unit_price: '6500.00' },
      ],
    },
  ]

  const mockSelectAddress = vi.fn()
  const mockAddAddress = vi.fn()
  const mockDeleteAddress = vi.fn()
  const mockUpdateUser = vi.fn()

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: mockUser,
      setUser: mockUpdateUser,
      getValidToken: vi.fn().mockResolvedValue('mock-token'),
    })

    vi.spyOn(AddressHook, 'useAddress').mockReturnValue({
      addresses: mockAddresses,
      activeAddress: mockAddresses[0],
      selectAddress: mockSelectAddress,
      addAddress: mockAddAddress,
      deleteAddress: mockDeleteAddress,
    })

    orderService.getOrders.mockResolvedValue({
      success: true,
      data: mockOrders,
    })
  })

  it('renders user profile info, personal data, and saved addresses', async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    expect(screen.getByDisplayValue('Juan Perez')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1144556677')).toBeInTheDocument()
    expect(screen.getByText('Casa')).toBeInTheDocument()
    expect(screen.getByText('Hotel')).toBeInTheDocument()
    expect(screen.getByText('Av. Corrientes 1234, 4B')).toBeInTheDocument()
  })

  it('updates personal data when submitting the profile form', async () => {
    authService.updateProfile.mockResolvedValueOnce({
      success: true,
      data: { ...mockUser, name: 'Juan Carlos Perez', phone: '1199887766' },
    })

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    const nameInput = screen.getByLabelText(/nombre completo/i)
    fireEvent.change(nameInput, { target: { value: 'Juan Carlos Perez' } })

    const saveBtn = screen.getByRole('button', { name: /guardar cambios/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Juan Carlos Perez' }),
        'mock-token'
      )
      expect(screen.getByText(/perfil actualizado con éxito/i)).toBeInTheDocument()
    })
  })

  it('allows adding a new custom address (e.g. Casa de mi amigo)', async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/ej: hotel, trabajo, casa de mi amigo/i), {
      target: { value: 'Casa de mi amigo' },
    })
    fireEvent.change(screen.getByPlaceholderText(/ej: av. rivadavia 4500/i), {
      target: { value: 'Av. Rivadavia 4500' },
    })

    const addBtn = screen.getByRole('button', { name: /agregar dirección/i })
    fireEvent.click(addBtn)

    expect(mockAddAddress).toHaveBeenCalledWith({
      label: 'Casa de mi amigo',
      address: 'Av. Rivadavia 4500',
    })
  })

  it('renders order history with statuses and details', async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    // Switch to orders tab
    const ordersTab = screen.getByRole('tab', { name: /mis pedidos/i })
    fireEvent.click(ordersTab)

    await waitFor(() => {
      expect(screen.getByText(/pedido #101/i)).toBeInTheDocument()
      expect(screen.getByText('Crazy Burgers')).toBeInTheDocument()
      expect(screen.getByText('Pendiente')).toBeInTheDocument()
      expect(screen.getByText(/pedido #102/i)).toBeInTheDocument()
      expect(screen.getByText('Entregado')).toBeInTheDocument()
    })
  })

  it('allows cancelling a pending order and updates UI to cancelled', async () => {
    orderService.updateOrderStatus.mockResolvedValueOnce({
      success: true,
      data: { ...mockOrders[0], status: 'cancelled' },
    })

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    const ordersTab = screen.getByRole('tab', { name: /mis pedidos/i })
    fireEvent.click(ordersTab)

    await waitFor(() => {
      expect(screen.getByText(/pedido #101/i)).toBeInTheDocument()
    })

    const cancelBtn = screen.getByRole('button', { name: /cancelar pedido/i })
    expect(cancelBtn).toBeInTheDocument()

    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(orderService.updateOrderStatus).toHaveBeenCalledWith(101, 'cancelled', 'mock-token')
      expect(screen.getByText('Cancelado')).toBeInTheDocument()
    })
  })

  it('does not show cancel button on orders that are already delivered or cancelled', async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    const ordersTab = screen.getByRole('tab', { name: /mis pedidos/i })
    fireEvent.click(ordersTab)

    await waitFor(() => {
      expect(screen.getByText(/pedido #102/i)).toBeInTheDocument()
    })

    // Only order #101 has the cancel button because order #102 is delivered
    const cancelButtons = screen.getAllByRole('button', { name: /cancelar pedido/i })
    expect(cancelButtons).toHaveLength(1)
  })

  it('directly shows orders tab when navigating to /pedidos', async () => {
    render(
      <MemoryRouter initialEntries={['/pedidos']}>
        <Profile />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/pedido #101/i)).toBeInTheDocument()
      expect(screen.queryByLabelText(/nombre completo/i)).not.toBeInTheDocument()
    })
  })

  it('switches between profile info and orders seamlessly when clicking tab buttons', async () => {
    render(
      <MemoryRouter initialEntries={['/perfil']}>
        <Routes>
          <Route path="/perfil" element={<Profile />} />
          <Route path="/pedidos" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByDisplayValue('Juan Perez')).toBeInTheDocument()

    const ordersTab = screen.getByRole('tab', { name: /mis pedidos/i })
    fireEvent.click(ordersTab)

    await waitFor(() => {
      expect(screen.getByText(/pedido #101/i)).toBeInTheDocument()
    })

    const infoTab = screen.getByRole('tab', { name: /datos y direcciones/i })
    fireEvent.click(infoTab)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan Perez')).toBeInTheDocument()
    })
  })

  it('directly shows favorites tab when navigating to /favoritos', async () => {
    render(
      <MemoryRouter initialEntries={['/favoritos']}>
        <Profile />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /mis tiendas favoritas/i })).toBeInTheDocument()
      expect(screen.getByText(/todavía no tenés tiendas favoritas/i)).toBeInTheDocument()
    })
  })

  it('renders rating button on delivered orders and opens rating modal', async () => {
    render(
      <MemoryRouter initialEntries={['/pedidos']}>
        <Profile />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/pedido #102/i)).toBeInTheDocument()
    })

    const rateBtn = screen.getByRole('button', { name: /calificar pedido #102/i })
    expect(rateBtn).toBeInTheDocument()

    fireEvent.click(rateBtn)

    expect(screen.getByRole('heading', { name: /¿cómo estuvo tu pedido\?/i })).toBeInTheDocument()
    expect(screen.getAllByText('Pizza Planet').length).toBeGreaterThanOrEqual(2)
  })
})
