import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CategoryCard from '../CategoryCard'

describe('CategoryCard Component (TP6 & TP9)', () => {
  const sampleCategoryWithImage = {
    id: 'burgers',
    title: 'Hamburguesas',
    subtitle: '15 locales',
    gradient: 'fr-grad-yellow',
    image: '/images/burger.png',
    featured: true,
  }

  const sampleCategoryWithEmoji = {
    id: 'pizza',
    title: 'Pizzas',
    subtitle: '8 locales',
    gradient: 'fr-grad-purple',
    emoji: '🍕',
    featured: false,
  }

  it('renders category title and subtitle correctly', () => {
    render(
      <MemoryRouter>
        <CategoryCard category={sampleCategoryWithImage} />
      </MemoryRouter>
    )

    expect(screen.getByText('Hamburguesas')).toBeInTheDocument()
    expect(screen.getByText('15 locales')).toBeInTheDocument()
  })

  it('renders image when image property is present', () => {
    render(
      <MemoryRouter>
        <CategoryCard category={sampleCategoryWithImage} />
      </MemoryRouter>
    )

    const img = screen.getByRole('img', { name: /hamburguesas/i })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/images/burger.png')
  })

  it('renders emoji fallback when image is not present', () => {
    render(
      <MemoryRouter>
        <CategoryCard category={sampleCategoryWithEmoji} />
      </MemoryRouter>
    )

    expect(screen.getByRole('img', { name: /pizzas/i })).toHaveTextContent('🍕')
  })

  it('renders link navigating to /tiendas?categoria=:id', () => {
    render(
      <MemoryRouter>
        <CategoryCard category={sampleCategoryWithImage} />
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: /ver hamburguesas/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/tiendas?categoria=burgers')
  })
})
