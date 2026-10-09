import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Home from '../Home'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'
import * as tokenUtils from '../../utils/token'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../services/authService', () => ({
  authService: {
    getProfile: vi.fn(),
  },
}))

describe('Home Component (TP8 Clean Code & TDD)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders categories and stores without crashing', () => {
    useAuth.mockReturnValue({
      user: null,
      setUser: vi.fn(),
      getValidToken: vi.fn().mockResolvedValue(null),
    })

    render(<Home />)

    expect(screen.getByText('¿Qué pedimos hoy?')).toBeInTheDocument()
    expect(screen.getByText('Tiendas destacadas')).toBeInTheDocument()
    expect(screen.getByText('Restaurantes')).toBeInTheDocument()
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

    render(<Home />)

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

    render(<Home />)

    expect(authService.getProfile).not.toHaveBeenCalled()
  })
})
