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

/**
 * Obtiene la URL de respaldo en el backend para una imagen que haya fallado en un CDN externo (ej. Cloudinary).
 *
 * @param {string} url - URL original que presentó error de carga
 * @returns {string} URL alternativa en el backend
 */
export function getFallbackImageUrl(url) {
  if (!url) return ''
  if (url.includes('cloudinary.com') && url.includes('/media/')) {
    const mediaPath = url.split('/media/').pop()
    if (mediaPath) {
      return `${BACKEND_BASE}/media/${mediaPath}`
    }
  }
  return url
}

/**
 * Registra un listener global (fase de captura) para capturar cualquier fallo de carga (404)
 * en imágenes y redirigirlas automáticamente al backend directo en Render sin alterar la UI.
 */
export function setupImageFallback() {
  if (typeof window === 'undefined') return

  window.addEventListener(
    'error',
    (event) => {
      const target = event.target
      if (
        target &&
        target.tagName === 'IMG' &&
        target.src &&
        !target.dataset.triedFallback
      ) {
        target.dataset.triedFallback = 'true'
        const fallbackUrl = getFallbackImageUrl(target.src)
        if (fallbackUrl && fallbackUrl !== target.src) {
          target.src = fallbackUrl
        }
      }
    },
    true
  )
}
