import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../utils/imageUrl'

/**
 * Obtiene las iniciales en mayúsculas a partir del nombre del comercio.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) return 'FR'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const GRADIENTS = ['fr-grad-1', 'fr-grad-2', 'fr-grad-3', 'fr-grad-4', 'fr-grad-5']

export default function StoreLogo({ store }) {
  const [imgError, setImgError] = useState(false)
  const gradientClass = store.gradient || GRADIENTS[(store.id || 0) % GRADIENTS.length] || 'fr-grad-1'
  const initials = store.initials || getInitials(store.name)
  const tagline = store.tagline || store.description || ''
  const resolvedImg = !imgError && store.image ? getImageUrl(store.image) : null

  const content = (
    <div className="text-center">
      <div className={`fr-store-logo mx-auto ${gradientClass} overflow-hidden shadow-sm`}>
        {resolvedImg ? (
          <img
            className="fr-store-logo-img w-100 h-100 object-fit-cover"
            src={resolvedImg}
            alt={store.name}
            onError={() => setImgError(true)}
          />
        ) : (
          initials
        )}
      </div>
      <p className="fw-semibold mb-0 mt-3 small text-dark">{store.name}</p>
      {tagline && <p className="text-secondary small mb-0 text-truncate" style={{ maxWidth: '140px' }}>{tagline}</p>}
    </div>
  )

  if (store.id) {
    return (
      <Link
        to={`/tiendas/${store.id}`}
        className="text-decoration-none d-block transition-hover"
        aria-label={`Ver tienda ${store.name}`}
      >
        {content}
      </Link>
    )
  }

  return content
}
