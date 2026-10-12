/**
 * Capa de servicio para gestionar direcciones de entrega guardadas y la dirección activa (TP9 - Issue #18).
 */

const STORAGE_KEY_PREFIX = 'foodrush_user_addresses_'
const ACTIVE_KEY_PREFIX = 'foodrush_active_address_'

function getStorageKey(userId) {
  return `${STORAGE_KEY_PREFIX}${userId || 'guest'}`
}

function getActiveKey(userId) {
  return `${ACTIVE_KEY_PREFIX}${userId || 'guest'}`
}

function getDefaultAddresses() {
  return [
    {
      id: 'addr-default-1',
      label: 'Casa',
      address: 'Av. Corrientes 1234, Piso 4 Depto B',
      isDefault: true,
    },
  ]
}

export const addressService = {
  /**
   * Obtiene la lista de direcciones del usuario (o crea una predeterminada si no tiene).
   * @param {number|string} userId
   * @returns {Array<{ id: string, label: string, address: string, isDefault?: boolean }>}
   */
  getAddresses(userId) {
    try {
      const stored = localStorage.getItem(getStorageKey(userId))
      if (!stored) {
        const defaults = getDefaultAddresses()
        this.saveAddresses(userId, defaults)
        return defaults
      }
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultAddresses()
    } catch {
      return getDefaultAddresses()
    }
  },

  /**
   * Guarda la lista completa de direcciones.
   * @param {number|string} userId
   * @param {Array} addresses
   */
  saveAddresses(userId, addresses) {
    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(addresses))
    } catch (e) {
      console.warn('Error al guardar direcciones en localStorage:', e)
    }
  },

  /**
   * Agrega una nueva dirección personalizada (ej. Casa, Hotel, Casa de mi amigo).
   * @param {number|string} userId
   * @param {{ label: string, address: string }} newAddress
   * @returns {Object} La dirección creada con ID generado
   */
  addAddress(userId, { label, address }) {
    const list = this.getAddresses(userId)
    const item = {
      id: `addr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      label: label.trim() || 'Dirección',
      address: address.trim(),
      isDefault: list.length === 0,
    }
    const updated = [...list, item]
    this.saveAddresses(userId, updated)
    return item
  },

  /**
   * Elimina una dirección por su ID.
   * @param {number|string} userId
   * @param {string} addressId
   */
  deleteAddress(userId, addressId) {
    const list = this.getAddresses(userId)
    const filtered = list.filter((a) => a.id !== addressId)
    const final = filtered.length > 0 ? filtered : getDefaultAddresses()
    this.saveAddresses(userId, final)

    const activeId = localStorage.getItem(getActiveKey(userId))
    if (activeId === addressId) {
      localStorage.removeItem(getActiveKey(userId))
    }
  },

  /**
   * Obtiene la dirección activa seleccionada por el usuario (para el pill y checkout).
   * @param {number|string} userId
   * @returns {Object}
   */
  getActiveAddress(userId) {
    const list = this.getAddresses(userId)
    const activeId = localStorage.getItem(getActiveKey(userId))
    if (activeId) {
      const found = list.find((a) => a.id === activeId)
      if (found) return found
    }
    const defaultAddr = list.find((a) => a.isDefault) || list[0]
    return defaultAddr || getDefaultAddresses()[0]
  },

  /**
   * Define cuál dirección está activa actualmente en la barra de navegación.
   * @param {number|string} userId
   * @param {string} addressId
   */
  setActiveAddress(userId, addressId) {
    try {
      localStorage.setItem(getActiveKey(userId), addressId)
    } catch (e) {
      console.warn('Error al guardar dirección activa:', e)
    }
  },
}
