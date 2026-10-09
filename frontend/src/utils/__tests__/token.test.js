import { describe, it, expect, beforeEach } from 'vitest'
import {
  decodeToken,
  isTokenExpired,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  setStoredTokens,
  clearStoredTokens,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
} from '../token'

function createMockJwt(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.mockSignature`
}

describe('Token Utilities (TP7 Clean Code & TDD)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('decodeToken', () => {
    it('returns null for null, undefined or non-string token', () => {
      expect(decodeToken(null)).toBeNull()
      expect(decodeToken(undefined)).toBeNull()
      expect(decodeToken(12345)).toBeNull()
      expect(decodeToken('')).toBeNull()
    })

    it('returns null for malformed token without dot parts', () => {
      expect(decodeToken('invalidtokenwithoutparts')).toBeNull()
    })

    it('decodes valid JWT payload correctly', () => {
      const mockPayload = { id: 1, email: 'test@example.com', role: 'cliente' }
      const token = createMockJwt(mockPayload)

      const decoded = decodeToken(token)
      expect(decoded).toMatchObject(mockPayload)
    })
  })

  describe('isTokenExpired', () => {
    it('returns true for null or empty token', () => {
      expect(isTokenExpired(null)).toBe(true)
      expect(isTokenExpired('')).toBe(true)
    })

    it('returns true when token exp claim is in the past', () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600 // 1 hora atrás
      const token = createMockJwt({ exp: pastTimestamp })

      expect(isTokenExpired(token)).toBe(true)
    })

    it('returns false when token exp claim is in the future', () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600 // 1 hora adelante
      const token = createMockJwt({ exp: futureTimestamp })

      expect(isTokenExpired(token)).toBe(false)
    })

    it('returns true when token lacks exp claim', () => {
      const token = createMockJwt({ user_id: 10 })
      expect(isTokenExpired(token)).toBe(true)
    })
  })

  describe('Storage Helpers', () => {
    it('stores and retrieves access and refresh tokens and user payload', () => {
      const user = { id: 5, name: 'Carlos', role: 'vendedor' }
      setStoredTokens({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user,
      })

      expect(getStoredAccessToken()).toBe('mock-access-token')
      expect(getStoredRefreshToken()).toBe('mock-refresh-token')
      expect(getStoredUser()).toEqual(user)
    })

    it('clears all tokens and user data on clearStoredTokens', () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, 'abc')
      localStorage.setItem(REFRESH_TOKEN_KEY, 'def')
      localStorage.setItem(USER_KEY, JSON.stringify({ id: 1 }))

      clearStoredTokens()

      expect(getStoredAccessToken()).toBeNull()
      expect(getStoredRefreshToken()).toBeNull()
      expect(getStoredUser()).toBeNull()
    })
  })
})
