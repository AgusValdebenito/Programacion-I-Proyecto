import { categories } from '../data/homeData'

export { categories }

/**
 * Obtiene la categoría correspondiente a una tienda gastronómica o comercial.
 * Si la tienda ya tiene asignada una categoría en backend la respeta; de lo contrario,
 * analiza semánticamente el nombre y descripción para asignarla al rubro adecuado.
 *
 * @param {object} store
 * @returns {number} ID de la categoría (1..5)
 */
export function getStoreCategory(store) {
  if (!store) return 1
  if (store.category_id) return Number(store.category_id)
  if (store.category) return Number(store.category)

  const text = `${store.name || ''} ${store.description || ''}`.toLowerCase()

  if (
    text.includes('farmacia') ||
    text.includes('medicamento') ||
    text.includes('salud') ||
    text.includes('higiene') ||
    text.includes('primeros auxilios')
  ) {
    return 5
  }

  if (
    text.includes('helad') ||
    text.includes('gelato') ||
    text.includes('paleta') ||
    text.includes('postres helados')
  ) {
    return 4
  }

  if (
    text.includes('café') ||
    text.includes('cafe') ||
    text.includes('cafeter') ||
    text.includes('meriendas') ||
    text.includes('tostado') ||
    text.includes('pasteler') ||
    text.includes('deli')
  ) {
    return 3
  }

  if (
    text.includes('market') ||
    text.includes('kiosco') ||
    text.includes('super') ||
    text.includes('almacén') ||
    text.includes('almacen') ||
    text.includes('snack') ||
    text.includes('golosina')
  ) {
    return 2
  }

  if (
    text.includes('burger') ||
    text.includes('pizza') ||
    text.includes('grill') ||
    text.includes('restaurante') ||
    text.includes('empanada') ||
    text.includes('comida') ||
    text.includes('papas')
  ) {
    return 1
  }

  return 1
}

/**
 * Retorna la información de una categoría a partir de su ID.
 *
 * @param {number|string} id
 * @returns {object|null}
 */
export function getCategoryById(id) {
  return categories.find((c) => String(c.id) === String(id)) || null
}
