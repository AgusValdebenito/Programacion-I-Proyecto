import { describe, it, expect } from 'vitest'
import { getStoreCategory, getCategoryById, categories } from '../categoryUtils'

describe('categoryUtils (TDD - Issue #38)', () => {
  it('correctly maps store keywords to categories', () => {
    expect(getStoreCategory({ name: 'Crazy Burgers', description: 'Hamburguesas y papas' })).toBe(1)
    expect(getStoreCategory({ name: 'Pizza Planet', description: 'Pizzas al horno' })).toBe(1)
    expect(getStoreCategory({ name: 'Mini Market Express', description: 'Golosinas y snacks' })).toBe(2)
    expect(getStoreCategory({ name: 'Café Central', description: 'Cafetería de especialidad' })).toBe(3)
    expect(getStoreCategory({ name: 'Heladería Gelato Real', description: 'Helados por kilo' })).toBe(4)
    expect(getStoreCategory({ name: 'Farmacia San Lucas', description: 'Medicamentos y salud' })).toBe(5)
  })

  it('respects store.category or store.category_id if provided directly', () => {
    expect(getStoreCategory({ name: 'Cualquier Cosa', category_id: 4 })).toBe(4)
    expect(getStoreCategory({ name: 'Cualquier Cosa', category: 2 })).toBe(2)
  })

  it('returns category object by id', () => {
    const cat = getCategoryById(1)
    expect(cat).toBeDefined()
    expect(cat.title).toBe('Restaurantes')

    expect(getCategoryById(999)).toBeNull()
  })

  it('contains all 5 expected categories', () => {
    expect(categories.length).toBe(5)
    expect(categories.map(c => c.title)).toEqual([
      'Restaurantes',
      'Súper y Kioscos',
      'Cafeterías',
      'Helados',
      'Farmacia',
    ])
  })
})
