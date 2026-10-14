const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const BACKEND_BASE = API_URL.replace(/\/api\/?$/, '')

/**
 * Resuelve y normaliza la URL de una imagen para su uso en etiquetas <img>.
 * Admite URLs absolutas (http/https), rutas relativas del backend (/media/...),
 * rutas relativas guardadas en el modelo (stores/..., products/...) y estáticos locales.
 *
 * @param {string} path - Ruta de la imagen
 * @returns {string} URL formateada
 */
export function getImageUrl(path) {
  if (!path) return ''

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  if (path.startsWith('/media/')) {
    return `${BACKEND_BASE}${path}`
  }

  if (path.startsWith('media/')) {
    return `${BACKEND_BASE}/${path}`
  }

  if (path.startsWith('stores/') || path.startsWith('products/')) {
    return `${BACKEND_BASE}/media/${path}`
  }

  if (path.startsWith('/')) {
    return path
  }

  return `/${path}`
}
