import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StoreLogo from '../StoreLogo'

describe('StoreLogo Component (TP6)', () => {
  const storeWithImage = {
    name: 'Burger King',
    tagline: 'A la parrilla',
    gradient: 'fr-grad-yellow',
    image: '/images/bk.png',
  }

  const storeWithInitials = {
    name: 'Pizzeria Los Hijos',
    tagline: 'Muzzarella clásica',
    gradient: 'fr-grad-purple',
    initials: 'PLH',
  }

  it('renders store name and tagline', () => {
    render(<StoreLogo store={storeWithImage} />)

    expect(screen.getByText('Burger King')).toBeInTheDocument()
    expect(screen.getByText('A la parrilla')).toBeInTheDocument()
  })

  it('renders image when store has image', () => {
    render(<StoreLogo store={storeWithImage} />)

    const img = screen.getByRole('img', { name: /burger king/i })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/images/bk.png')
  })

  it('renders initials when store has no image', () => {
    render(<StoreLogo store={storeWithInitials} />)

    expect(screen.getByText('PLH')).toBeInTheDocument()
  })
})
