import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '../ProductCard'

describe('ProductCard Component (TP9 TDD)', () => {
  const availableProduct = {
    id: 1,
    name: 'Crazy Burger Simple',
    description: 'Medallón 150g, cheddar y lechuga',
    price: '4200.00',
    stock: 20,
    is_available: true,
    image: '/images/burger.jpg',
  }

  const outOfStockProduct = {
    id: 2,
    name: 'Crazy Bacon Doble',
    description: 'Doble medallón y panceta',
    price: '5600.00',
    stock: 0,
    is_available: true,
  }

  const unavailableProduct = {
    id: 3,
    name: 'Crazy Veggie Burger',
    description: 'Lentejas y champiñones',
    price: '4800.00',
    stock: 10,
    is_available: false,
  }

  it('renders product name, description and formatted price', () => {
    render(<ProductCard product={availableProduct} />)

    expect(screen.getByText('Crazy Burger Simple')).toBeInTheDocument()
    expect(screen.getByText('Medallón 150g, cheddar y lechuga')).toBeInTheDocument()
    expect(screen.getByText(/4[.,]?200/)).toBeInTheDocument()
  })

  it('renders product image when available', () => {
    render(<ProductCard product={availableProduct} />)

    const img = screen.getByRole('img', { name: /crazy burger simple/i })
    expect(img).toHaveAttribute('src', '/images/burger.jpg')
  })

  it('calls onAddToCart handler when "Agregar" button is clicked', () => {
    const handleAddToCart = vi.fn()
    render(<ProductCard product={availableProduct} onAddToCart={handleAddToCart} />)

    const button = screen.getByRole('button', { name: /agregar/i })
    expect(button).not.toBeDisabled()
    fireEvent.click(button)

    expect(handleAddToCart).toHaveBeenCalledTimes(1)
    expect(handleAddToCart).toHaveBeenCalledWith(availableProduct)
  })

  it('disables button and shows "Sin stock" badge when stock is 0', () => {
    const handleAddToCart = vi.fn()
    render(<ProductCard product={outOfStockProduct} onAddToCart={handleAddToCart} />)

    expect(screen.getAllByText(/sin stock/i).length).toBeGreaterThanOrEqual(1)
    const button = screen.getByRole('button', { name: /sin stock/i })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(handleAddToCart).not.toHaveBeenCalled()
  })

  it('disables button and shows "No disponible" badge when is_available is false', () => {
    render(<ProductCard product={unavailableProduct} />)

    expect(screen.getAllByText(/no disponible/i).length).toBeGreaterThanOrEqual(1)
    const button = screen.getByRole('button', { name: /no disponible/i })
    expect(button).toBeDisabled()
  })
})
