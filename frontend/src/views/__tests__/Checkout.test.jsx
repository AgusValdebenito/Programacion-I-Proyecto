import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Checkout from '../Checkout'
import * as CartHook from '../../hooks/useCart'

describe('Checkout View Component (TP9 TDD - Issue #17)', () => {
  const mockProduct = {
    id: 101,
    name: 'Crazy Burger Simple',
    price: '4200.00',
    store: 5,
    store_name: 'Crazy Burgers',
  }

  const mockCartItems = [
    {
      id: 1,
      cart: 10,
      product: 101,
      quantity: 2,
      product_details: mockProduct,
    },
  ]

  const mockCheckout = vi.fn()

  beforeEach(() => {
    vi.restoreAllMocks()
    mockCheckout.mockReset()
  })

  it('renders empty cart message when cart has no items', () => {
    vi.spyOn(CartHook, 'useCart').mockReturnValue({
      items: [],
      itemCount: 0,
      totalAmount: 0,
      loading: false,
      checkout: mockCheckout,
    })

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    )

    expect(screen.getByText(/no tenés productos en tu carrito/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ir a la tienda/i })).toBeInTheDocument()
  })

  it('renders checkout form, delivery fields, payment methods, and order summary', () => {
    vi.spyOn(CartHook, 'useCart').mockReturnValue({
      items: mockCartItems,
      itemCount: 2,
      totalAmount: 8400,
      loading: false,
      checkout: mockCheckout,
    })

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /finalizar compra/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/dirección de entrega/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/teléfono de contacto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/aclaraciones o notas/i)).toBeInTheDocument()
    expect(screen.getByText(/efectivo al recibir/i)).toBeInTheDocument()
    expect(screen.getByText(/crazy burger simple/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirmar y realizar pedido/i })).toBeInTheDocument()
  })

  it('validates required fields before allowing checkout submission', async () => {
    vi.spyOn(CartHook, 'useCart').mockReturnValue({
      items: mockCartItems,
      itemCount: 2,
      totalAmount: 8400,
      loading: false,
      checkout: mockCheckout,
    })

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    )

    const submitBtn = screen.getByRole('button', { name: /confirmar y realizar pedido/i })
    fireEvent.click(submitBtn)

    expect(screen.getByText(/ingresá la dirección de entrega/i)).toBeInTheDocument()
    expect(screen.getByText(/ingresá un teléfono de contacto/i)).toBeInTheDocument()
    expect(mockCheckout).not.toHaveBeenCalled()
  })

  it('submits checkout successfully and renders order confirmation screen', async () => {
    const mockCreatedOrder = {
      id: 99,
      store_name: 'Crazy Burgers',
      total: '8400.00',
      status: 'pending',
    }

    mockCheckout.mockResolvedValueOnce({
      success: true,
      data: mockCreatedOrder,
    })

    vi.spyOn(CartHook, 'useCart').mockReturnValue({
      items: mockCartItems,
      itemCount: 2,
      totalAmount: 8400,
      loading: false,
      checkout: mockCheckout,
    })

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/dirección de entrega/i), {
      target: { value: 'Av. Corrientes 1234, 4to B' },
    })
    fireEvent.change(screen.getByLabelText(/teléfono de contacto/i), {
      target: { value: '11 5555-8888' },
    })

    const submitBtn = screen.getByRole('button', { name: /confirmar y realizar pedido/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockCheckout).toHaveBeenCalled()
      expect(screen.getByText(/¡pedido confirmado con éxito!/i)).toBeInTheDocument()
      expect(screen.getByText(/#99/)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /ver mis pedidos/i })).toBeInTheDocument()
    })
  })

  it('displays error banner when checkout fails', async () => {
    mockCheckout.mockResolvedValueOnce({
      success: false,
      error: 'Stock insuficiente para Crazy Burger Simple. Stock disponible: 1.',
    })

    vi.spyOn(CartHook, 'useCart').mockReturnValue({
      items: mockCartItems,
      itemCount: 2,
      totalAmount: 8400,
      loading: false,
      checkout: mockCheckout,
    })

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/dirección de entrega/i), {
      target: { value: 'Calle Falsa 123' },
    })
    fireEvent.change(screen.getByLabelText(/teléfono de contacto/i), {
      target: { value: '11 1234-5678' },
    })

    const submitBtn = screen.getByRole('button', { name: /confirmar y realizar pedido/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockCheckout).toHaveBeenCalled()
      expect(
        screen.getByText(/stock insuficiente para crazy burger simple/i)
      ).toBeInTheDocument()
    })
  })
})
