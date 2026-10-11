import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StoreLogo from '../StoreLogo'

describe('StoreLogo Component (TP6 & TP9)', () => {
  const storeWithImage = {
    id: 1,
    name: 'Burger King',
    tagline: 'A la parrilla',
    gradient: 'fr-grad-yellow',
    image: '/images/bk.png',
  }

  const storeWithInitials = {
    id: 2,
    name: 'Pizzeria Los Hijos',
    tagline: 'Muzzarella clásica',
    gradient: 'fr-grad-purple',
    initials: 'PLH',
  }

  const apiStore = {
    id: 5,
    name: 'Crazy Burgers',
    description: 'Hamburguesas artesanales premium',
    image: null,
  }

  it('renders store name and tagline', () => {
    render(
      <MemoryRouter>
        <StoreLogo store={storeWithImage} />
      </MemoryRouter>
    )

    expect(screen.getByText('Burger King')).toBeInTheDocument()
    expect(screen.getByText('A la parrilla')).toBeInTheDocument()
  })

  it('renders image when store has image', () => {
    render(
      <MemoryRouter>
        <StoreLogo store={storeWithImage} />
      </MemoryRouter>
    )

    const img = screen.getByRole('img', { name: /burger king/i })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/images/bk.png')
  })

  it('renders initials when store has no image', () => {
    render(
      <MemoryRouter>
        <StoreLogo store={storeWithInitials} />
      </MemoryRouter>
    )

    expect(screen.getByText('PLH')).toBeInTheDocument()
  })

  it('generates automatic initials when neither image nor initials are provided (API store)', () => {
    render(
      <MemoryRouter>
        <StoreLogo store={apiStore} />
      </MemoryRouter>
    )

    expect(screen.getByText('CB')).toBeInTheDocument()
    expect(screen.getByText('Crazy Burgers')).toBeInTheDocument()
    expect(screen.getByText('Hamburguesas artesanales premium')).toBeInTheDocument()
  })

  it('renders accessible link pointing to /tiendas/:id', () => {
    render(
      <MemoryRouter>
        <StoreLogo store={apiStore} />
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: /crazy burgers/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/tiendas/5')
  })
})
