import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BottomNav from '../BottomNav'

describe('BottomNav Component (TP6)', () => {
  it('renders mobile navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <BottomNav />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /explorar/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /pedidos/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /mi perfil/i })).toBeInTheDocument()
  })

  it('marks active link with aria-current="page"', () => {
    render(
      <MemoryRouter initialEntries={['/pedidos']}>
        <BottomNav />
      </MemoryRouter>
    )

    const pedidosLink = screen.getByRole('link', { name: /pedidos/i })
    expect(pedidosLink).toHaveAttribute('aria-current', 'page')
    expect(pedidosLink).toHaveClass('active')

    const inicioLink = screen.getByRole('link', { name: /inicio/i })
    expect(inicioLink).not.toHaveAttribute('aria-current')
  })
})
