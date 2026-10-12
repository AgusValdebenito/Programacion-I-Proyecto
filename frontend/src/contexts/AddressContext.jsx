import { createContext, useState, useCallback, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { addressService } from '../services/addressService'

// eslint-disable-next-line react-refresh/only-export-components
export const AddressContext = createContext()

export function AddressProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id || 'guest'

  const [addresses, setAddresses] = useState(() => addressService.getAddresses(userId))
  const [activeAddress, setActiveAddressState] = useState(() =>
    addressService.getActiveAddress(userId)
  )

  const [prevUserId, setPrevUserId] = useState(userId)

  if (userId !== prevUserId) {
    setPrevUserId(userId)
    setAddresses(addressService.getAddresses(userId))
    setActiveAddressState(addressService.getActiveAddress(userId))
  }

  const reloadAddresses = useCallback(() => {
    const list = addressService.getAddresses(userId)
    const active = addressService.getActiveAddress(userId)
    setAddresses(list)
    setActiveAddressState(active)
  }, [userId])

  const selectAddress = useCallback(
    (addressId) => {
      addressService.setActiveAddress(userId, addressId)
      const active = addressService.getActiveAddress(userId)
      setActiveAddressState(active)
    },
    [userId]
  )

  const addAddress = useCallback(
    ({ label, address }) => {
      const created = addressService.addAddress(userId, { label, address })
      addressService.setActiveAddress(userId, created.id)
      reloadAddresses()
      return created
    },
    [userId, reloadAddresses]
  )

  const deleteAddress = useCallback(
    (addressId) => {
      addressService.deleteAddress(userId, addressId)
      reloadAddresses()
    },
    [userId, reloadAddresses]
  )

  const value = useMemo(
    () => ({
      addresses,
      activeAddress,
      selectAddress,
      addAddress,
      deleteAddress,
      reloadAddresses,
    }),
    [addresses, activeAddress, selectAddress, addAddress, deleteAddress, reloadAddresses]
  )

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
}
