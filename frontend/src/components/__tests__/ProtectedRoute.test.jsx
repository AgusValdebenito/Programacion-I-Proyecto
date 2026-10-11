import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import * as useAuthModule from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('ProtectedRoute Component (TP7)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading spinner while authentication state is loading', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      loading: true,
      getToken: () => null,
      isTokenExpired: () => true,
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <ProtectedRoute>
          <div>Contenido Protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
    expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument()
  })

  it('redirects to /login when user is not authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      getToken: () => null,
      isTokenExpired: () => true,
    })

    render(
      <MemoryRouter initialEntries={['/protegido']}>
        <Routes>
          <Route path="/login" element={<div>Pantalla de Login</div>} />
          <Route
            path="/protegido"
            element={
              <ProtectedRoute>
                <div>Contenido Protegido</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Pantalla de Login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument()
  })

  it('renders protected children when user is authenticated with a valid token', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: 1, name: 'Juan', role: 'cliente' },
      loading: false,
      getToken: () => 'valid-jwt-token',
      isTokenExpired: () => false,
    })

    render(
      <MemoryRouter initialEntries={['/protegido']}>
        <Routes>
          <Route path="/login" element={<div>Pantalla de Login</div>} />
          <Route
            path="/protegido"
            element={
              <ProtectedRoute>
                <div>Contenido Protegido</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Contenido Protegido')).toBeInTheDocument()
    expect(screen.queryByText('Pantalla de Login')).not.toBeInTheDocument()
  })

  it('renders children when user role matches one of the allowedRoles', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: 2, name: 'Admin User', role: 'admin' },
      loading: false,
      getToken: () => 'valid-admin-token',
      isTokenExpired: () => false,
    })

    render(
      <MemoryRouter initialEntries={['/admin-panel']}>
        <Routes>
          <Route path="/" element={<div>Inicio</div>} />
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute allowedRoles={['admin', 'vendedor']}>
                <div>Panel Administrativo</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Panel Administrativo')).toBeInTheDocument()
  })

  it('redirects to / when user does not have an allowed role', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: 3, name: 'Cliente Normal', role: 'cliente' },
      loading: false,
      getToken: () => 'valid-client-token',
      isTokenExpired: () => false,
    })

    render(
      <MemoryRouter initialEntries={['/admin-panel']}>
        <Routes>
          <Route path="/" element={<div>Inicio</div>} />
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute allowedRoles={['admin', 'vendedor']}>
                <div>Panel Administrativo</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.queryByText('Panel Administrativo')).not.toBeInTheDocument()
  })
})
