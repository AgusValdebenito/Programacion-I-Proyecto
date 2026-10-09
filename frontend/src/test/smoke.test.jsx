import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { AuthProvider } from '../contexts/AuthContext'

describe('Frontend Infrastructure & React Setup (TP5)', () => {
  it('renders application structure without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/tu@email\.com/i)).toBeInTheDocument()
  })

  it('runs tests in jsdom environment with document and window defined', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
    expect(document.createElement('div')).toBeDefined()
  })
})
