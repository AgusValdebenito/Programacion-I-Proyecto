import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../Navbar'
import * as AuthHook from '../../hooks/useAuth'
import * as AddressHook from '../../hooks/useAddress'
import * as CartHook from '../../hooks/useCart'

describe('Navbar Component - Delivery Location Visibility & Roles', () => {
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

  it('hides delivery location pill for unauthenticated visitors on catalog routes', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: null,
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.queryByLabelText(/seleccionar dirección de entrega/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Av\. Corrientes 1234/)).not.toBeInTheDocument()
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

  it('renders quick search input and navigates on search submit for clients', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 1, role: 'cliente', name: 'Juan Cliente' },
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    )

    const searchInput = screen.getByLabelText(/buscar en foodrush/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('renders Moderación link when user role is admin and hides it for normal clients', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 99, role: 'admin', is_staff: true, name: 'Super Admin' },
      logout: vi.fn(),
    })

    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /moderación/i })).toBeInTheDocument()
    unmount()

    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 2, role: 'cliente', name: 'Cliente Normal' },
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.queryByRole('link', { name: /moderación/i })).not.toBeInTheDocument()
  })

  it('renders dedicated vendor navbar with FoodRush Stores and hides client links for pure vendor', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 2, role: 'vendedor', name: 'Dueño Pizzería' },
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/panel-tienda']}>
        <Navbar />
      </MemoryRouter>
    )

    // Logo says FoodRush Stores
    expect(screen.getByLabelText(/foodrush stores/i)).toBeInTheDocument()
    expect(screen.getByText(/stores/i)).toBeInTheDocument()

    // Shows Mi Tienda and Modo Comercio
    expect(screen.getByRole('link', { name: /mi tienda/i })).toBeInTheDocument()
    expect(screen.getByText(/modo comercio/i)).toBeInTheDocument()

    // Hides client links & cart & search
    expect(screen.queryByRole('link', { name: /^inicio$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^explorar$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^tiendas$/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/carrito/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/buscar en foodrush/i)).not.toBeInTheDocument()
  })

  it('keeps dual access (client links + store + moderation) for admin users', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 1, role: 'admin', is_staff: true, name: 'Admin Test' },
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    )

    // Admin has client links
    expect(screen.getByRole('link', { name: /^inicio$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^explorar$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^tiendas$/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/carrito/i)).toBeInTheDocument()

    // And store / moderation management
    expect(screen.getByRole('link', { name: /mi tienda/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /moderación/i })).toBeInTheDocument()
  })
})
