import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StoreProductsTable from '../StoreProductsTable'

describe('StoreProductsTable Component', () => {
  const mockProducts = [
    {
      id: 1,
      name: 'Hamburguesa Doble',
      description: 'Carne y cheddar',
      price: '4500.00',
      stock: 15,
      is_available: true,
      image: 'products/burger.jpg',
    },
    {
      id: 2,
      name: 'Papas Fritas',
      description: 'Crocantes',
      price: '2000.00',
      stock: 0,
      is_available: false,
      image: null,
    },
  ]

  const defaultProps = {
    filteredProducts: mockProducts,
    loadingProducts: false,
    productsError: null,
    productSearch: '',
    onSearchChange: vi.fn(),
    onRefresh: vi.fn(),
    onNewProduct: vi.fn(),
    onLoadSampleProducts: vi.fn(),
    onEditProduct: vi.fn(),
    onDeleteProduct: vi.fn(),
    onToggleAvailability: vi.fn(),
    deletingProductId: null,
  }

  it('renders products table with item details, prices, and stock', () => {
    render(<StoreProductsTable {...defaultProps} />)

    expect(screen.getByText('Carta y Productos del Local')).toBeInTheDocument()
    expect(screen.getByText('Hamburguesa Doble')).toBeInTheDocument()
    expect(screen.getByText('$4500.00')).toBeInTheDocument()
    expect(screen.getByText('15 u.')).toBeInTheDocument()

    expect(screen.getByText('Papas Fritas')).toBeInTheDocument()
    expect(screen.getByText('$2000.00')).toBeInTheDocument()
    expect(screen.getByText('0 u.')).toBeInTheDocument()
  })

  it('calls onSearchChange when user types in the search input', () => {
    const onSearchChange = vi.fn()
    render(<StoreProductsTable {...defaultProps} onSearchChange={onSearchChange} />)

    const searchInput = screen.getByPlaceholderText(/buscar por nombre o descripción/i)
    fireEvent.change(searchInput, { target: { value: 'Hamburguesa' } })

    expect(onSearchChange).toHaveBeenCalledWith('Hamburguesa')
  })

  it('calls onToggleAvailability when switch is clicked', () => {
    const onToggleAvailability = vi.fn()
    render(<StoreProductsTable {...defaultProps} onToggleAvailability={onToggleAvailability} />)

    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[0])

    expect(onToggleAvailability).toHaveBeenCalledWith(mockProducts[0])
  })

  it('calls onNewProduct when "Nuevo Producto" button is clicked', () => {
    const onNewProduct = vi.fn()
    render(<StoreProductsTable {...defaultProps} onNewProduct={onNewProduct} />)

    const newBtn = screen.getByRole('button', { name: /nuevo producto/i })
    fireEvent.click(newBtn)

    expect(onNewProduct).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when there are no products', () => {
    render(<StoreProductsTable {...defaultProps} filteredProducts={[]} />)

    expect(screen.getByText(/no se encontraron productos/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /agregar primer producto/i })).toBeInTheDocument()
  })
})
