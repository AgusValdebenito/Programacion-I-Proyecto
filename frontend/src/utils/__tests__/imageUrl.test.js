import { describe, it, expect } from 'vitest'
import { getImageUrl, getFallbackImageUrl } from '../imageUrl'

describe('imageUrl utility (TDD)', () => {
  it('returns empty string for null or undefined', () => {
    expect(getImageUrl(null)).toBe('')
    expect(getImageUrl(undefined)).toBe('')
    expect(getImageUrl('')).toBe('')
  })

  it('keeps absolute http/https URLs intact', () => {
    expect(getImageUrl('https://images.unsplash.com/photo-123')).toBe(
      'https://images.unsplash.com/photo-123'
    )
    expect(getImageUrl('http://cdn.example.com/img.png')).toBe('http://cdn.example.com/img.png')
  })

  it('prepends backend base for /media/ paths', () => {
    const result = getImageUrl('/media/products/burger.jpg')
    expect(result).toMatch(/http:\/\/localhost:8000\/media\/products\/burger\.jpg/)
  })

  it('prepends backend media for stores/ or products/ paths', () => {
    const resultStore = getImageUrl('stores/crazy_burgers.jpg')
    expect(resultStore).toMatch(/http:\/\/localhost:8000\/media\/stores\/crazy_burgers\.jpg/)

    const resultProd = getImageUrl('products/pizza.jpg')
    expect(resultProd).toMatch(/http:\/\/localhost:8000\/media\/products\/pizza\.jpg/)
  })

  it('keeps relative paths starting with / as local frontend assets', () => {
    expect(getImageUrl('/images/restaurantes.png')).toBe('/images/restaurantes.png')
  })

  it('resolves fallback backend media URL when Cloudinary URL fails', () => {
    const failedCdnUrl = 'https://res.cloudinary.com/ed4lhzzl/image/upload/v1/media/stores/parrilla_asador.jpg'
    const fallback = getFallbackImageUrl(failedCdnUrl)
    expect(fallback).toBe('http://localhost:8000/media/stores/parrilla_asador.jpg')
  })
})
