import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../authService'

describe('authService (TP8 Clean Code & TDD)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('login', () => {
    it('returns success: true and data on successful 200 response', async () => {
      const mockResponse = {
        access: 'mock-access',
        refresh: 'mock-refresh',
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
      }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await authService.login('test@example.com', 'password123')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    it('returns success: false and formatted error message on 400 response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Credenciales incorrectas' }),
      })

      const result = await authService.login('test@example.com', 'wrongpassword')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Credenciales incorrectas')
    })
  })

  describe('register', () => {
    it('returns success: true and created user data on 201 response', async () => {
      const payload = {
        username: 'juan',
        name: 'Juan Perez',
        email: 'juan@example.com',
        password: 'Password123!',
      }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, ...payload }),
      })

      const result = await authService.register(payload)
      expect(result.success).toBe(true)
      expect(result.data.email).toBe('juan@example.com')
    })

    it('returns field-specific error message when registration fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({ email: ['Este correo ya se encuentra registrado.'] }),
      })

      const result = await authService.register({ email: 'duplicado@example.com' })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Este correo ya se encuentra registrado.')
    })
  })

  describe('refreshAccessToken', () => {
    it('returns new access token on successful refresh', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access: 'new-access-token' }),
      })

      const access = await authService.refreshAccessToken('valid-refresh')
      expect(access).toBe('new-access-token')
    })

    it('returns null on failed refresh', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Token blacklisted' }),
      })

      const access = await authService.refreshAccessToken('expired-refresh')
      expect(access).toBeNull()
    })
  })

  describe('logout', () => {
    it('calls logout endpoint with refresh token and Bearer header', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ detail: 'Sesion cerrada' }),
      })

      await authService.logout('refresh-token-123', 'access-token-456')

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/logout/'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer access-token-456',
          }),
          body: JSON.stringify({ refresh: 'refresh-token-123' }),
        })
      )
    })
  })

  describe('getProfile', () => {
    it('returns profile data when authenticated', async () => {
      const mockProfile = { id: 1, name: 'Juan', email: 'juan@example.com' }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      })

      const profile = await authService.getProfile('valid-token')
      expect(profile).toEqual(mockProfile)
    })

    it('returns null when profile request fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
      })

      const profile = await authService.getProfile('invalid-token')
      expect(profile).toBeNull()
    })
  })
})
