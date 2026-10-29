import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RatingModal from '../RatingModal'
import { orderService } from '../../services/orderService'
import * as authHook from '../../hooks/useAuth'

describe('RatingModal Component (Milestone 7 - Issue #44)', () => {
  const mockOrder = {
    id: 101,
    store_name: 'Burger Joint',
    status: 'delivered',
  }

  const mockGetValidToken = vi.fn().mockResolvedValue('fake-token')
  const mockOnClose = vi.fn()
  const mockOnRatingSubmitted = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      getValidToken: mockGetValidToken,
    })
  })

  it('renders null when isOpen is false', () => {
    const { container } = render(
      <RatingModal
        order={mockOrder}
        isOpen={false}
        onClose={mockOnClose}
        onRatingSubmitted={mockOnRatingSubmitted}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders null when order is null', () => {
    const { container } = render(
      <RatingModal
        order={null}
        isOpen={true}
        onClose={mockOnClose}
        onRatingSubmitted={mockOnRatingSubmitted}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders modal with order info, default 5 stars and positive tags', () => {
    render(
      <RatingModal
        order={mockOrder}
        isOpen={true}
        onClose={mockOnClose}
        onRatingSubmitted={mockOnRatingSubmitted}
      />
    )

    expect(screen.getByText(/¿Cómo estuvo tu pedido\?/i)).toBeInTheDocument()
    expect(screen.getByText('#101')).toBeInTheDocument()
    expect(screen.getByText('Burger Joint')).toBeInTheDocument()
    expect(screen.getByText('¡Excelente! 🤩')).toBeInTheDocument()

    // Positive tag is present
    expect(screen.getByRole('button', { name: /comida caliente/i })).toBeInTheDocument()
  })

  it('switches to negative tags when rating is 3 or less', () => {
    render(
      <RatingModal
        order={mockOrder}
        isOpen={true}
        onClose={mockOnClose}
        onRatingSubmitted={mockOnRatingSubmitted}
      />
    )

    // Click 2 stars
    const star2 = screen.getByRole('button', { name: /calificar con 2 estrellas/i })
    fireEvent.click(star2)

    expect(screen.getByText('Malo 😕')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /demora excesiva/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /comida caliente/i })).not.toBeInTheDocument()
  })

  it('toggles tag selection', () => {
    render(
      <RatingModal
        order={mockOrder}
        isOpen={true}
        onClose={mockOnClose}
        onRatingSubmitted={mockOnRatingSubmitted}
      />
    )

    const tagBtn = screen.getByRole('button', { name: /comida caliente/i })
    expect(tagBtn).toHaveClass('btn-outline-secondary')

    fireEvent.click(tagBtn)
    expect(tagBtn).toHaveClass('btn-primary')

    fireEvent.click(tagBtn)
    expect(tagBtn).toHaveClass('btn-outline-secondary')
  })

  it('submits rating successfully', async () => {
    vi.spyOn(orderService, 'rateOrder').mockResolvedValue({
      success: true,
      data: {
        id: 1,
        order: 101,
        rating: 5,
        tags: ['Muy rico'],
        comment: 'Estaba delicioso',
      },
    })

    render(
      <RatingModal
        order={mockOrder}
        isOpen={true}
        onClose={mockOnClose}
        onRatingSubmitted={mockOnRatingSubmitted}
      />
    )

    // Select tag
    fireEvent.click(screen.getByRole('button', { name: /muy rico/i }))

    // Type comment
    const textarea = screen.getByPlaceholderText(/contanos más detalles/i)
    fireEvent.change(textarea, { target: { value: 'Estaba delicioso' } })

    // Submit
    const submitBtn = screen.getByRole('button', { name: /enviar calificación/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(orderService.rateOrder).toHaveBeenCalledWith(
        101,
        {
          rating: 5,
          tags: ['Muy rico'],
          comment: 'Estaba delicioso',
        },
        'fake-token'
      )
      expect(mockOnRatingSubmitted).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('displays error message if service fails', async () => {
    vi.spyOn(orderService, 'rateOrder').mockResolvedValue({
      success: false,
      error: 'Ya calificaste este pedido anteriormente.',
    })

    render(
      <RatingModal
        order={mockOrder}
        isOpen={true}
        onClose={mockOnClose}
        onRatingSubmitted={mockOnRatingSubmitted}
      />
    )

    const submitBtn = screen.getByRole('button', { name: /enviar calificación/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Ya calificaste este pedido anteriormente.'
      )
    })
  })

  it('calls onClose when close button or cancel is clicked', () => {
    render(
      <RatingModal
        order={mockOrder}
        isOpen={true}
        onClose={mockOnClose}
        onRatingSubmitted={mockOnRatingSubmitted}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(mockOnClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /cerrar modal de calificación/i }))
    expect(mockOnClose).toHaveBeenCalledTimes(2)
  })
})
