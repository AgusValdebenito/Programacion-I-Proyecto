import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FavoriteButton from '../FavoriteButton'
import * as useFavoritesHook from '../../hooks/useFavorites'

describe('FavoriteButton Component (Milestone 6 - Issue #42)', () => {
  const mockStore = {
    id: 1,
    name: 'Crazy Burgers',
  }

  const toggleFavoriteMock = vi.fn().mockResolvedValue({ success: true, favorited: true })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useFavoritesHook, 'useFavorites').mockReturnValue({
      isFavorite: vi.fn((id) => id === 2),
      toggleFavorite: toggleFavoriteMock,
    })
  })

  it('renders null when store is missing or invalid', () => {
    const { container } = render(<FavoriteButton store={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders un-favorited heart icon when store is not favorite', () => {
    render(<FavoriteButton store={mockStore} />)

    const btn = screen.getByRole('button', { name: /guardar crazy burgers en favoritos/i })
    expect(btn).toBeInTheDocument()
    expect(btn.querySelector('.bi-heart')).toBeInTheDocument()
    expect(btn.querySelector('.bi-heart-fill')).not.toBeInTheDocument()
  })

  it('renders favorited heart icon when store is favorite', () => {
    const favoritedStore = { id: 2, name: 'Pizza Planet' }
    render(<FavoriteButton store={favoritedStore} />)

    const btn = screen.getByRole('button', { name: /quitar pizza planet de favoritos/i })
    expect(btn).toBeInTheDocument()
    expect(btn.querySelector('.bi-heart-fill')).toBeInTheDocument()
  })

  it('toggles favorite and prevents propagation when clicked', async () => {
    const parentClick = vi.fn()
    render(
      <div onClick={parentClick}>
        <FavoriteButton store={mockStore} />
      </div>
    )

    const btn = screen.getByRole('button', { name: /guardar crazy burgers en favoritos/i })
    fireEvent.click(btn)

    expect(toggleFavoriteMock).toHaveBeenCalledWith(mockStore)
    expect(parentClick).not.toHaveBeenCalled()
  })

  it('renders text label when showLabel is true', () => {
    render(<FavoriteButton store={mockStore} showLabel />)
    expect(screen.getByText('Guardar')).toBeInTheDocument()

    const favoritedStore = { id: 2, name: 'Pizza Planet' }
    render(<FavoriteButton store={favoritedStore} showLabel />)
    expect(screen.getByText('Favorito')).toBeInTheDocument()
  })

  it('applies custom size class and custom className', () => {
    const { container } = render(<FavoriteButton store={mockStore} size="sm" className="custom-class" />)
    const btn = container.querySelector('button')
    expect(btn).toHaveClass('custom-class')
    expect(btn).toHaveClass('btn-sm')
  })
})
