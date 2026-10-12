import { useContext } from 'react'
import { AddressContext } from '../contexts/AddressContext'

export function useAddress() {
  const context = useContext(AddressContext)
  if (!context) {
    return {
      addresses: [],
      activeAddress: { id: 'default', label: 'Casa', address: 'Av. Corrientes 1234' },
      selectAddress: () => {},
      addAddress: () => {},
      deleteAddress: () => {},
      reloadAddresses: () => {},
    }
  }
  return context
}
