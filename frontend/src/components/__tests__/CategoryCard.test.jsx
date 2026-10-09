import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CategoryCard from '../CategoryCard'

describe('CategoryCard Component (TP6)', () => {
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
    render(<CategoryCard category={sampleCategoryWithImage} />)

    expect(screen.getByText('Hamburguesas')).toBeInTheDocument()
    expect(screen.getByText('15 locales')).toBeInTheDocument()
  })

  it('renders image when image property is present', () => {
    render(<CategoryCard category={sampleCategoryWithImage} />)

    const img = screen.getByRole('img', { name: /hamburguesas/i })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/images/burger.png')
  })

  it('renders emoji fallback when image is not present', () => {
    render(<CategoryCard category={sampleCategoryWithEmoji} />)

    expect(screen.getByRole('img', { name: /pizzas/i })).toHaveTextContent('🍕')
  })

  it('has accessible action button with aria-label', () => {
    render(<CategoryCard category={sampleCategoryWithImage} />)

    const button = screen.getByRole('button', { name: /ver hamburguesas/i })
    expect(button).toBeInTheDocument()
  })
})
