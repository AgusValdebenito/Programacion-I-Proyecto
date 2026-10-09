/**
 * Utilidades puras para la gestión, decodificación y persistencia de tokens JWT.
 */

export const ACCESS_TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'
export const USER_KEY = 'user'

/**
 * Decodifica de forma segura el payload de un token JWT en formato JSON.
 * @param {string} token - Token JWT
 * @returns {object|null} - Payload decodificado o null si el token es inválido
 */
export function decodeToken(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const decodedJson = atob(payloadBase64)
    return JSON.parse(decodedJson)
  } catch {
    return null
  }
}

/**
 * Comprueba si un token JWT ha expirado comparando su claim 'exp' con la hora actual.
 * @param {string} token - Token JWT
 * @returns {boolean} - true si el token no existe, está corrupto o expiró
 */
export function isTokenExpired(token) {
  const payload = decodeToken(token)
  if (!payload || !payload.exp) return true
  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getStoredUser() {
  try {
    const saved = localStorage.getItem(USER_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function setStoredTokens({ access, refresh, user }) {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
