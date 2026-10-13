import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../Navbar'
import * as AuthHook from '../../hooks/useAuth'
import * as AddressHook from '../../hooks/useAddress'
import * as CartHook from '../../hooks/useCart'

describe('Navbar Component - Delivery Location Visibility', () => {
  const mockAddress = {
    id: 'addr-1',
    label: 'Casa',
    address: 'Av. Corrientes 1234, Piso 4 Depto B',
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(AddressHook, 'useAddress').mockReturnValue({
      addresses: [mockAddress],
      activeAddress: mockAddress,
      selectAddress: vi.fn(),
    })
    vi.spyOn(CartHook, 'useCart').mockReturnValue({
      itemCount: 0,
    })
  })

  it('renders delivery location pill on public catalog routes for client users', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 1, role: 'cliente', name: 'Juan Cliente' },
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/seleccionar dirección de entrega/i)).toBeInTheDocument()
    expect(screen.getByText(/Av\. Corrientes 1234/)).toBeInTheDocument()
  })

  it('hides delivery location pill on /login', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: null,
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.queryByLabelText(/seleccionar dirección de entrega/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Av\. Corrientes 1234/)).not.toBeInTheDocument()
  })

  it('hides delivery location pill on /register', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: null,
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.queryByLabelText(/seleccionar dirección de entrega/i)).not.toBeInTheDocument()
  })

  it('hides delivery location pill on /panel-tienda', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 2, role: 'vendedor', name: 'Dueño Pizzería' },
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/panel-tienda']}>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.queryByLabelText(/seleccionar dirección de entrega/i)).not.toBeInTheDocument()
  })

  it('hides delivery location pill for pure vendor users even on catalog pages', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 2, role: 'vendedor', name: 'Dueño Pizzería' },
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/tiendas']}>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.queryByLabelText(/seleccionar dirección de entrega/i)).not.toBeInTheDocument()
  })

  it('shows delivery location pill for admin users on catalog pages', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 1, role: 'admin', is_staff: true, name: 'Admin Test' },
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/seleccionar dirección de entrega/i)).toBeInTheDocument()
  })
})
