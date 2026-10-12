import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Stores from '../Stores'
import { storeService } from '../../services/storeService'

vi.mock('../../services/storeService', () => ({
  storeService: {
    getStores: vi.fn(),
  },
}))

describe('Stores View Component (TP9 TDD - Issue #38)', () => {
  const mockStores = [
    {
      id: 5,
      name: 'Crazy Burgers',
      description: 'Hamburguesas artesanales premium y papas crujientes',
    },
    {
      id: 9,
      name: 'Pizza Planet',
      description: 'Pizzas al horno de leña y empanadas caseras',
    },
    {
      id: 10,
      name: 'Café Central',
      description: 'Cafetería de especialidad, pastelería fina y tostados',
    },
    {
      id: 12,
      name: 'Mini Market Express',
      description: 'Golosinas, snacks y artículos de almacén',
    },
    {
      id: 13,
      name: 'Heladería Gelato Real',
      description: 'Helados artesanales por kilo y postres helados',
    },
    {
      id: 14,
      name: 'Farmacia San Lucas',
      description: 'Medicamentos, primeros auxilios y cuidado personal',
    },
  ]

  beforeEach(() => {
    vi.restoreAllMocks()
    storeService.getStores.mockResolvedValue({ success: true, data: mockStores })
  })

  it('renders loading spinner while stores are being fetched', () => {
    storeService.getStores.mockReturnValue(new Promise(() => {}))

    render(
      <MemoryRouter initialEntries={['/tiendas']}>
        <Stores />
      </MemoryRouter>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getAllByText(/cargando tiendas/i).length).toBeGreaterThan(0)
  })

  it('renders error alert with retry button when store fetching fails', async () => {
    storeService.getStores
      .mockResolvedValueOnce({ success: false, error: 'Error al conectar con la API' })
      .mockResolvedValueOnce({ success: true, data: mockStores })

    render(
      <MemoryRouter initialEntries={['/tiendas']}>
        <Stores />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Error al conectar con la API')).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /reintentar/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Crazy Burgers')).toBeInTheDocument()
    })
  })

  it('renders all stores and category filter chips by default', async () => {
    render(
      <MemoryRouter initialEntries={['/tiendas']}>
        <Stores />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Crazy Burgers')).toBeInTheDocument()
      expect(screen.getByText('Pizza Planet')).toBeInTheDocument()
      expect(screen.getByText('Café Central')).toBeInTheDocument()
      expect(screen.getByText('Mini Market Express')).toBeInTheDocument()
      expect(screen.getByText('Heladería Gelato Real')).toBeInTheDocument()
      expect(screen.getByText('Farmacia San Lucas')).toBeInTheDocument()
    })

    // Category chips exist
    expect(screen.getByRole('button', { name: /todos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /restaurantes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /súper y kioscos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cafeterías/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /helados/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /farmacia/i })).toBeInTheDocument()
  })

  it('filters stores when a category chip is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/tiendas']}>
        <Stores />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Crazy Burgers')).toBeInTheDocument()
    })

    // Click Farmacia category chip
    const farmaciaChip = screen.getByRole('button', { name: /farmacia/i })
    fireEvent.click(farmaciaChip)

    // Should only show Farmacia
    expect(screen.getByText('Farmacia San Lucas')).toBeInTheDocument()
    expect(screen.queryByText('Crazy Burgers')).not.toBeInTheDocument()
    expect(screen.queryByText('Pizza Planet')).not.toBeInTheDocument()
    expect(screen.queryByText('Café Central')).not.toBeInTheDocument()

    // Click Restaurantes category chip
    const restaurantesChip = screen.getByRole('button', { name: /restaurantes/i })
    fireEvent.click(restaurantesChip)

    expect(screen.getByText('Crazy Burgers')).toBeInTheDocument()
    expect(screen.getByText('Pizza Planet')).toBeInTheDocument()
    expect(screen.queryByText('Farmacia San Lucas')).not.toBeInTheDocument()
  })

  it('pre-selects category filter when URL has ?categoria query param', async () => {
    render(
      <MemoryRouter initialEntries={['/tiendas?categoria=4']}>
        <Routes>
          <Route path="/tiendas" element={<Stores />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      // Category 4 is Helados
      expect(screen.getByText('Heladería Gelato Real')).toBeInTheDocument()
    })

    expect(screen.queryByText('Crazy Burgers')).not.toBeInTheDocument()
    expect(screen.queryByText('Pizza Planet')).not.toBeInTheDocument()
    expect(screen.queryByText('Farmacia San Lucas')).not.toBeInTheDocument()
  })

  it('filters stores in real-time by search input', async () => {
    render(
      <MemoryRouter initialEntries={['/tiendas']}>
        <Stores />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Crazy Burgers')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/buscar tiendas o productos/i)
    fireEvent.change(searchInput, { target: { value: 'pizza' } })

    expect(screen.getByText('Pizza Planet')).toBeInTheDocument()
    expect(screen.queryByText('Crazy Burgers')).not.toBeInTheDocument()
    expect(screen.queryByText('Farmacia San Lucas')).not.toBeInTheDocument()
  })

  it('shows friendly empty state when no stores match search and allows clearing filters', async () => {
    render(
      <MemoryRouter initialEntries={['/tiendas']}>
        <Stores />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Crazy Burgers')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/buscar tiendas o productos/i)
    fireEvent.change(searchInput, { target: { value: 'inexistente 12345' } })

    expect(screen.getByText(/no encontramos comercios/i)).toBeInTheDocument()

    const clearBtn = screen.getByRole('button', { name: /limpiar filtros/i })
    fireEvent.click(clearBtn)

    expect(screen.getByText('Crazy Burgers')).toBeInTheDocument()
    expect(screen.getByText('Farmacia San Lucas')).toBeInTheDocument()
  })

  it('links each store card to its respective /tiendas/:id detail page', async () => {
    render(
      <MemoryRouter initialEntries={['/tiendas']}>
        <Stores />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Crazy Burgers')).toBeInTheDocument()
    })

    const storeLink = screen.getByRole('link', { name: /crazy burgers/i })
    expect(storeLink).toHaveAttribute('href', '/tiendas/5')
  })
})
