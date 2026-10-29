import { useState } from 'react'
import { useFavorites } from '../hooks/useFavorites'

/**
 * Botón interactivo de corazón para marcar o desmarcar tiendas favoritas (Issue #42).
 *
 * @param {Object} props
 * @param {Object} props.store - Objeto tienda con al menos { id, name }
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Tamaño visual del botón
 * @param {boolean} [props.showLabel=false] - Si muestra texto junto al icono
 * @param {string} [props.className=''] - Clases adicionales
 */
export default function FavoriteButton({
  store,
  size = 'md',
  showLabel = false,
  className = '',
}) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const [animating, setAnimating] = useState(false)

  if (!store || !store.id) return null

  const favorited = isFavorite(store.id)

  const handleClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    setAnimating(true)
    setTimeout(() => setAnimating(false), 380)

    await toggleFavorite(store)
  }

  const sizeClass =
    size === 'sm' ? 'btn-sm fs-6' : size === 'lg' ? 'btn-lg fs-4' : 'fs-5'

  const label = favorited
    ? `Quitar ${store.name || 'tienda'} de favoritos`
    : `Guardar ${store.name || 'tienda'} en favoritos`

  return (
    <button
      type="button"
      className={`fr-favorite-btn ${favorited ? 'is-favorite' : ''} ${
        animating ? 'animate-heart' : ''
      } ${sizeClass} ${className}`}
      onClick={handleClick}
      aria-label={label}
      title={label}
    >
      <i
        className={`bi ${
          favorited ? 'bi-heart-fill text-danger' : 'bi-heart'
        }`}
      />
      {showLabel && (
        <span className="ms-2 small fw-semibold">
          {favorited ? 'Favorito' : 'Guardar'}
        </span>
      )}
    </button>
  )
}
