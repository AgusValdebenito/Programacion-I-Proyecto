import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { FavoritesProvider, FavoritesContext } from '../FavoritesContext'
import * as useAuthHook from '../../hooks/useAuth'
import { storeService } from '../../services/storeService'

function ConsumerComponent() {
  return (
    <FavoritesContext.Consumer>
      {(ctx) => (
        <div>
          <span data-testid="count">{ctx.favorites.length}</span>
          <span data-testid="is-fav-1">{ctx.isFavorite(1) ? 'YES' : 'NO'}</span>
          <span data-testid="is-fav-2">{ctx.isFavorite(2) ? 'YES' : 'NO'}</span>
          <button
            type="button"
            data-testid="toggle-1"
            onClick={() => ctx.toggleFavorite({ id: 1, name: 'Store 1' })}
          >
            Toggle 1
          </button>
        </div>
      )}
    </FavoritesContext.Consumer>
  )
}

describe('FavoritesContext (Milestone 6 - Issue #42)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      user: { id: 99, email: 'user@test.com' },
      getValidToken: vi.fn().mockResolvedValue('token-123'),
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('initializes from localStorage if available', async () => {
    localStorage.setItem(
      'foodrush_favorites_99',
      JSON.stringify([{ id: 2, name: 'Store 2' }])
    )

    vi.spyOn(storeService, 'getFavoriteStores').mockResolvedValue({
      success: true,
      data: [{ id: 2, name: 'Store 2' }],
    })

    await act(async () => {
      render(
        <FavoritesProvider>
          <ConsumerComponent />
        </FavoritesProvider>
      )
    })

    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByTestId('is-fav-2')).toHaveTextContent('YES')
    expect(screen.getByTestId('is-fav-1')).toHaveTextContent('NO')
  })

  it('syncs with backend API when authenticated user is present', async () => {
    const apiStores = [
      { id: 1, name: 'Store 1' },
      { id: 2, name: 'Store 2' },
    ]
    vi.spyOn(storeService, 'getFavoriteStores').mockResolvedValue({
      success: true,
      data: apiStores,
    })

    await act(async () => {
      render(
        <FavoritesProvider>
          <ConsumerComponent />
        </FavoritesProvider>
      )
    })

    expect(screen.getByTestId('count')).toHaveTextContent('2')
    expect(screen.getByTestId('is-fav-1')).toHaveTextContent('YES')
    expect(screen.getByTestId('is-fav-2')).toHaveTextContent('YES')
    expect(JSON.parse(localStorage.getItem('foodrush_favorites_99'))).toHaveLength(2)
  })

  it('optimistically adds a store to favorites and calls backend', async () => {
    vi.spyOn(storeService, 'getFavoriteStores').mockResolvedValue({
      success: true,
      data: [],
    })
    const toggleSpy = vi.spyOn(storeService, 'toggleFavorite').mockResolvedValue({
      success: true,
      favorited: true,
      store_id: 1,
    })

    await act(async () => {
      render(
        <FavoritesProvider>
          <ConsumerComponent />
        </FavoritesProvider>
      )
    })

    expect(screen.getByTestId('count')).toHaveTextContent('0')

    await act(async () => {
      screen.getByTestId('toggle-1').click()
    })

    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByTestId('is-fav-1')).toHaveTextContent('YES')
    expect(toggleSpy).toHaveBeenCalledWith(1, 'token-123')
  })

  it('reverts optimistic update if backend returns error', async () => {
    vi.spyOn(storeService, 'getFavoriteStores').mockResolvedValue({
      success: true,
      data: [],
    })
    vi.spyOn(storeService, 'toggleFavorite').mockResolvedValue({
      success: false,
      error: 'Error de servidor',
    })

    await act(async () => {
      render(
        <FavoritesProvider>
          <ConsumerComponent />
        </FavoritesProvider>
      )
    })

    await act(async () => {
      screen.getByTestId('toggle-1').click()
    })

    // After reversion, count goes back to 0
    expect(screen.getByTestId('count')).toHaveTextContent('0')
    expect(screen.getByTestId('is-fav-1')).toHaveTextContent('NO')
  })
})
