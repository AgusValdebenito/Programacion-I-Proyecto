import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotificationDropdown from '../NotificationDropdown'
import * as authHook from '../../hooks/useAuth'
import { orderService } from '../../services/orderService'
import { storeService } from '../../services/storeService'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('NotificationDropdown Component (Milestone 7 - Issue #40)', () => {
  const mockUserClient = {
    id: 1,
    role: 'cliente',
    name: 'Cliente Demo',
  }

  const mockUserVendor = {
    id: 2,
    role: 'vendedor',
    name: 'Chef Mario',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: mockUserClient,
      getValidToken: vi.fn().mockResolvedValue('fake-token'),
    })
    vi.spyOn(orderService, 'getOrders').mockResolvedValue({
      success: true,
      data: [],
    })
    vi.spyOn(storeService, 'getMyStore').mockResolvedValue({
      success: false,
    })
    vi.spyOn(orderService, 'getStoreOrders').mockResolvedValue({
      success: true,
      data: [],
    })
  })

  it('renders bell button without badge when there are no unread notifications', async () => {
    render(
      <MemoryRouter>
        <NotificationDropdown />
      </MemoryRouter>
    )

    const bellBtn = screen.getByRole('button', { name: /notificaciones/i })
    expect(bellBtn).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument()
    })
  })

  it('opens and closes dropdown when clicking the bell button', async () => {
    render(
      <MemoryRouter>
        <NotificationDropdown />
      </MemoryRouter>
    )

    const bellBtn = screen.getByRole('button', { name: /notificaciones/i })
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /panel de notificaciones/i })).not.toBeInTheDocument()
    })

    fireEvent.click(bellBtn)
    expect(screen.getByRole('region', { name: /panel de notificaciones/i })).toBeInTheDocument()

    fireEvent.click(bellBtn)
    expect(screen.queryByRole('region', { name: /panel de notificaciones/i })).not.toBeInTheDocument()
  })

  it('renders empty state when there are no notifications', async () => {
    render(
      <MemoryRouter>
        <NotificationDropdown />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(orderService.getOrders).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole('button', { name: /notificaciones/i }))
    expect(screen.getByTestId('notifications-empty')).toBeInTheDocument()
    expect(screen.getByText(/no tenés notificaciones pendientes/i)).toBeInTheDocument()
  })

  it('generates client notifications for orders in preparing, delivering, and unrated delivered', async () => {
    vi.spyOn(orderService, 'getOrders').mockResolvedValue({
      success: true,
      data: [
        {
          id: 10,
          store_name: 'Pizzería Napoles',
          status: 'preparing',
        },
        {
          id: 11,
          store_name: 'Burger Club',
          status: 'delivering',
        },
        {
          id: 12,
          store_name: 'Sushi Zen',
          status: 'delivered',
          rating: null,
        },
      ],
    })

    render(
      <MemoryRouter>
        <NotificationDropdown />
      </MemoryRouter>
    )

    await waitFor(() => {
      const badge = screen.getByTestId('notification-badge')
      expect(badge).toHaveTextContent('3')
    })

    // Open dropdown
    fireEvent.click(screen.getByRole('button', { name: /notificaciones/i }))

    expect(screen.getByText('Pedido #10 en preparación')).toBeInTheDocument()
    expect(screen.getByText('¡Pedido #11 en camino!')).toBeInTheDocument()
    expect(screen.getByText('Pedido #12 entregado')).toBeInTheDocument()
  })

  it('generates vendor notification for pending kitchen orders', async () => {
    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: mockUserVendor,
      getValidToken: vi.fn().mockResolvedValue('fake-token'),
    })
    vi.spyOn(orderService, 'getOrders').mockResolvedValue({
      success: true,
      data: [],
    })
    vi.spyOn(storeService, 'getMyStore').mockResolvedValue({
      success: true,
      data: { id: 7, name: 'La Parrilla' },
    })
    vi.spyOn(orderService, 'getStoreOrders').mockResolvedValue({
      success: true,
      data: [
        { id: 99, status: 'pending', total: '12000' },
      ],
    })

    render(
      <MemoryRouter>
        <NotificationDropdown />
      </MemoryRouter>
    )

    await waitFor(() => {
      const badge = screen.getByTestId('notification-badge')
      expect(badge).toHaveTextContent('1')
    })

    fireEvent.click(screen.getByRole('button', { name: /notificaciones/i }))
    expect(screen.getByText('Nuevo pedido entrante #99')).toBeInTheDocument()
  })

  it('marks all notifications as read when clicking "Marcar todas leídas"', async () => {
    const customList = [
      {
        id: 'n1',
        title: 'Pedido #1 en camino',
        message: 'Llega en 10 min',
        link: '/pedidos',
      },
      {
        id: 'n2',
        title: 'Pedido #2 entregado',
        message: 'Calificá tu orden',
        link: '/pedidos',
      },
    ]

    render(
      <MemoryRouter>
        <NotificationDropdown customNotifications={customList} />
      </MemoryRouter>
    )

    expect(screen.getByTestId('notification-badge')).toHaveTextContent('2')

    fireEvent.click(screen.getByRole('button', { name: /notificaciones/i }))

    const markAllBtn = screen.getByRole('button', { name: /marcar todas leídas/i })
    fireEvent.click(markAllBtn)

    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument()
  })

  it('marks single notification as read, navigates, and closes dropdown upon click', async () => {
    const customList = [
      {
        id: 'n-nav',
        title: 'Pedido #5 en preparación',
        message: 'Cocinando',
        link: '/pedidos',
      },
    ]

    render(
      <MemoryRouter>
        <NotificationDropdown customNotifications={customList} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /notificaciones/i }))

    const itemBtn = screen.getByTestId('notification-item-n-nav')
    fireEvent.click(itemBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/pedidos')
    expect(screen.queryByRole('region', { name: /panel de notificaciones/i })).not.toBeInTheDocument()
    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument()
  })

  it('closes dropdown when Escape key is pressed', async () => {
    render(
      <MemoryRouter>
        <NotificationDropdown />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(orderService.getOrders).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole('button', { name: /notificaciones/i }))
    expect(screen.getByRole('region', { name: /panel de notificaciones/i })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('region', { name: /panel de notificaciones/i })).not.toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', async () => {
    render(
      <MemoryRouter>
        <div>
          <button type="button" data-testid="outside-button">Afuera</button>
          <NotificationDropdown />
        </div>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(orderService.getOrders).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole('button', { name: /notificaciones/i }))
    expect(screen.getByRole('region', { name: /panel de notificaciones/i })).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByTestId('outside-button'))
    expect(screen.queryByRole('region', { name: /panel de notificaciones/i })).not.toBeInTheDocument()
  })
})
