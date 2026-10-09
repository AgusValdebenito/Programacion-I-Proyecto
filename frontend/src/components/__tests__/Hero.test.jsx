import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Hero from '../Hero'

describe('Hero Component (TP6)', () => {
  it('renders default badge when no userName is passed', () => {
    render(<Hero />)

    expect(screen.getByText('Exclusivo FoodRush')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/promociones/i)
    expect(screen.getByText('50% OFF')).toBeInTheDocument()
  })

  it('renders personalized greeting when userName is provided', () => {
    render(<Hero userName="Agustín" />)

    expect(screen.getByText('¡Hola, Agustín! Exclusivo FoodRush')).toBeInTheDocument()
  })

  it('contains call-to-action anchor to categories section', () => {
    render(<Hero />)

    const cta = screen.getByRole('link', { name: /explorar promociones/i })
    expect(cta).toHaveAttribute('href', '#categorias')
  })
})
