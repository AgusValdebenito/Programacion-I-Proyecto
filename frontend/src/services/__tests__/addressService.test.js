import { describe, it, expect, beforeEach } from 'vitest'
import { addressService } from '../addressService'

describe('Address Service (TP9 TDD - Issue #18)', () => {
  const userId = 42

  beforeEach(() => {
    localStorage.clear()
  })

  it('returns default initial address when no addresses exist for user', () => {
    const addresses = addressService.getAddresses(userId)
    expect(addresses.length).toBeGreaterThanOrEqual(1)
    expect(addresses[0].label).toBe('Casa')
    expect(addresses[0].isDefault).toBe(true)
  })

  it('adds a new custom address (e.g., Hotel, Casa de mi amigo)', () => {
    const newAddress = addressService.addAddress(userId, {
      label: 'Hotel',
      address: 'Av. Libertador 1200, Hab 304',
    })

    expect(newAddress.id).toBeDefined()
    expect(newAddress.label).toBe('Hotel')
    expect(newAddress.address).toBe('Av. Libertador 1200, Hab 304')

    const all = addressService.getAddresses(userId)
    expect(all).toHaveLength(2)
  })

  it('sets and retrieves the active address for navigation and checkout', () => {
    const added = addressService.addAddress(userId, {
      label: 'Casa de mi amigo',
      address: 'Calle Falsa 123',
    })

    addressService.setActiveAddress(userId, added.id)
    const active = addressService.getActiveAddress(userId)

    expect(active.id).toBe(added.id)
    expect(active.label).toBe('Casa de mi amigo')
  })

  it('deletes an address and falls back to default active address', () => {
    const added = addressService.addAddress(userId, {
      label: 'Trabajo',
      address: 'Paseo Colón 456',
    })

    addressService.setActiveAddress(userId, added.id)
    expect(addressService.getActiveAddress(userId).id).toBe(added.id)

    addressService.deleteAddress(userId, added.id)
    const all = addressService.getAddresses(userId)
    expect(all.find((a) => a.id === added.id)).toBeUndefined()

    const active = addressService.getActiveAddress(userId)
    expect(active.label).toBe('Casa')
  })
})
