import { describe, it, expect } from 'vitest'
import { formatPrice } from '../formatters'

describe('formatPrice utility', () => {
  it('formats numeric values properly with two decimals', () => {
    expect(formatPrice(10)).toBe('$10.00')
    expect(formatPrice(12.5)).toBe('$12.50')
    expect(formatPrice(1234.567)).toBe('$1234.57')
  })

  it('handles strings and falsy values safely', () => {
    expect(formatPrice('2500')).toBe('$2500.00')
    expect(formatPrice(null)).toBe('$0.00')
    expect(formatPrice(undefined)).toBe('$0.00')
    expect(formatPrice('')).toBe('$0.00')
  })
})
