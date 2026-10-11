import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Cart from '../Cart'
import * as CartHook from '../../hooks/useCart'

describe('Cart View Component (TP9 TDD)', () => {
  const mockProduct1 = {
    id: 101,
    name: 'Crazy Burger Simple',
    price: '4200.00',
    stock: 10,
    store: 5,
  }

  const mockProduct2 = {
    id: 102,
    name: 'Papas Cheddar',
    price: '2000.00',
    stock: 15,
    store: 5,
  }

  const mockCartItems = [
    {
      id: 1,
      cart: 10,
      product: 101,
      quantity: 2,
      product_details: mockProduct1,
    },
    {
      id: 2,
      cart: 10,
      product: 102,
      quantity: 1,
      product_details: mockProduct2,
    },
  ]

  const mockUpdateQuantity = vi.fn().mockResolvedValue({ success: true })
  const mockRemoveItem = vi.fn().mockResolvedValue({ success: true })
  const mockClearCart = vi.fn().mockResolvedValue({ success: true })

  beforeEach(() => {
    vi.restoreAllMocks()
    mockUpdateQuantity.mockResolvedValue({ success: true })
    mockRemoveItem.mockResolvedValue({ success: true })
    mockClearCart.mockResolvedValue({ success: true })
  })

  it('renders friendly empty state when cart has no items', () => {
    vi.spyOn(CartHook, 'useCart').mockReturnValue({
      items: [],
      itemCount: 0,
      totalAmount: 0,
      loading: false,
      error: null,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
    })

    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    )

    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /explorar comercios/i })).toBeInTheDocument()
  })

  it('renders cart items list, item quantities, and calculated total', () => {
    vi.spyOn(CartHook, 'useCart').mockReturnValue({
      items: mockCartItems,
      itemCount: 3,
      totalAmount: 10400,
      loading: false,
      error: null,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
    })

    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    )

    expect(screen.getByText('Crazy Burger Simple')).toBeInTheDocument()
    expect(screen.getByText('Papas Cheddar')).toBeInTheDocument()
    expect(screen.getAllByText(/10[.,]?400/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('link', { name: /continuar al checkout/i })).toBeInTheDocument()
  })

  it('calls updateQuantity when increment and decrement buttons are pressed', async () => {
    vi.spyOn(CartHook, 'useCart').mockReturnValue({
      items: mockCartItems,
      itemCount: 3,
      totalAmount: 10400,
      loading: false,
      error: null,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
    })

    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    )

    const incrementBtns = screen.getAllByRole('button', { name: /aumentar cantidad/i })
    await act(async () => {
      fireEvent.click(incrementBtns[0])
    })
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3)

    const decrementBtns = screen.getAllByRole('button', { name: /reducir cantidad/i })
    await act(async () => {
      fireEvent.click(decrementBtns[0])
    })
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 1)
  })

  it('calls removeItem when trash button is clicked', async () => {
    vi.spyOn(CartHook, 'useCart').mockReturnValue({
      items: mockCartItems,
      itemCount: 3,
      totalAmount: 10400,
      loading: false,
      error: null,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
    })

    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    )

    const removeBtns = screen.getAllByRole('button', { name: /eliminar producto/i })
    await act(async () => {
      fireEvent.click(removeBtns[0])
    })
    expect(mockRemoveItem).toHaveBeenCalledWith(1)
  })

  it('calls clearCart when clicking "Vaciar carrito"', async () => {
    vi.spyOn(CartHook, 'useCart').mockReturnValue({
      items: mockCartItems,
      itemCount: 3,
      totalAmount: 10400,
      loading: false,
      error: null,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
    })

    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    )

    const clearBtn = screen.getByRole('button', { name: /vaciar carrito/i })
    await act(async () => {
      fireEvent.click(clearBtn)
    })
    expect(mockClearCart).toHaveBeenCalled()
  })
})
