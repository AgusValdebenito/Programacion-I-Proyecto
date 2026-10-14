import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../Home'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'
import { storeService } from '../../services/storeService'
import * as tokenUtils from '../../utils/token'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../services/authService', () => ({
  authService: {
    getProfile: vi.fn(),
  },
}))

vi.mock('../../services/storeService', () => ({
  storeService: {
    getStores: vi.fn(),
  },
}))

describe('Home Component (TP8 & TP9 Clean Code & TDD)', () => {
  const mockStores = [
    { id: 5, name: 'Crazy Burgers', description: 'Hamburguesas artesanales' },
    { id: 9, name: 'Pizza Planet', description: 'Pizzas al horno' },
    { id: 10, name: 'Café Central', description: 'Cafetería de especialidad' },
  ]

  beforeEach(() => {
    vi.restoreAllMocks()
    storeService.getStores.mockResolvedValue({ success: true, data: mockStores })
  })

  it('renders loading spinner while stores are being fetched', () => {
    storeService.getStores.mockReturnValue(new Promise(() => {}))
    useAuth.mockReturnValue({
      user: null,
      setUser: vi.fn(),
      getValidToken: vi.fn().mockResolvedValue(null),
    })

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getAllByText(/cargando tiendas/i).length).toBeGreaterThan(0)
  })

  it('renders categories and dynamic stores from API without crashing', async () => {
    useAuth.mockReturnValue({
      user: null,
      setUser: vi.fn(),
      getValidToken: vi.fn().mockResolvedValue(null),
    })

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect(screen.getByText('¿Qué pedimos hoy?')).toBeInTheDocument()
    expect(screen.getByText('Tiendas destacadas')).toBeInTheDocument()
    expect(screen.getByText('Restaurantes')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getAllByText('Crazy Burgers').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Pizza Planet').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Café Central').length).toBeGreaterThan(0)
    })
  })

  it('renders friendly empty state when no stores are returned by the API', async () => {
    storeService.getStores.mockResolvedValueOnce({ success: true, data: [] })
    useAuth.mockReturnValue({
      user: null,
      setUser: vi.fn(),
      getValidToken: vi.fn().mockResolvedValue(null),
    })

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/no hay tiendas disponibles en este momento/i)).toBeInTheDocument()
    })
  })

  it('renders error alert with retry button when fetching stores fails and retries', async () => {
    storeService.getStores
      .mockResolvedValueOnce({ success: false, error: 'Fallo de conexión con la API' })
      .mockResolvedValueOnce({ success: true, data: mockStores })

    useAuth.mockReturnValue({
      user: null,
      setUser: vi.fn(),
      getValidToken: vi.fn().mockResolvedValue(null),
    })

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Fallo de conexión con la API')).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /reintentar/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getAllByText('Crazy Burgers').length).toBeGreaterThan(0)
    })
  })

  it('fetches profile and updates user when a valid token is present', async () => {
    const mockSetUser = vi.fn()
    const setStoredTokensSpy = vi.spyOn(tokenUtils, 'setStoredTokens')
    useAuth.mockReturnValue({
      user: { id: 1, username: 'testuser' },
      setUser: mockSetUser,
      getValidToken: vi.fn().mockResolvedValue('valid-access-token'),
    })

    authService.getProfile.mockResolvedValueOnce({
      id: 1,
      username: 'testuser',
      name: 'Test Full Name',
      email: 'test@example.com',
    })

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(authService.getProfile).toHaveBeenCalledWith('valid-access-token')
      expect(mockSetUser).toHaveBeenCalled()
      expect(setStoredTokensSpy).toHaveBeenCalledWith({
        user: expect.objectContaining({ name: 'Test Full Name' }),
      })
    })
  })

  it('does not call authService.getProfile if getValidToken returns null', async () => {
    useAuth.mockReturnValue({
      user: null,
      setUser: vi.fn(),
      getValidToken: vi.fn().mockResolvedValue(null),
    })

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect(authService.getProfile).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.getAllByText('Crazy Burgers').length).toBeGreaterThan(0)
    })
  })
})
