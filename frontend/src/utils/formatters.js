/**
 * Utilidades compartidas de formateo de datos (Clean Code & DRY).
 */

/**
 * Formatea un valor numérico o string numérico como precio en moneda ($0.00).
 * @param {number|string|null|undefined} val
 * @returns {string}
 */
export const formatPrice = (val) => `$${parseFloat(val || 0).toFixed(2)}`
