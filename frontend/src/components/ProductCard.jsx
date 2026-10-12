import { useState } from 'react'
import { getImageUrl } from '../utils/imageUrl'

/**
 * Componente de tarjeta de producto gastronómico (TP9).
 *
 * @param {Object} props
 * @param {Object} props.product - Datos del producto desde la API
 * @param {function} [props.onAddToCart] - Callback para agregar el producto al carrito
 */
export default function ProductCard({ product, onAddToCart }) {
  const [imgError, setImgError] = useState(false)
  const isOutOfStock = product.stock === 0
  const isUnavailable = !product.is_available
  const isActionDisabled = isOutOfStock || isUnavailable

  // Formato de precio en moneda argentina ($X.XXX)
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(product.price) || 0)

  const handleAdd = () => {
    if (!isActionDisabled && onAddToCart) {
      onAddToCart(product)
    }
  }

  const resolvedImg = !imgError && product.image ? getImageUrl(product.image) : null

  return (
    <article className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden d-flex flex-column">
      <div
        className="position-relative bg-light d-flex align-items-center justify-content-center overflow-hidden"
        style={{ height: '180px' }}
      >
        {resolvedImg ? (
          <img
            src={resolvedImg}
            alt={product.name}
            className="w-100 h-100 object-fit-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-secondary opacity-50 display-4">
            <i className="bi bi-egg-fried" />
          </div>
        )}

        {/* Badges de disponibilidad y stock */}
        <div className="position-absolute top-0 end-0 p-2 d-flex flex-column gap-1 align-items-end">
          {isUnavailable ? (
            <span className="badge bg-secondary shadow-sm">No disponible</span>
          ) : isOutOfStock ? (
            <span className="badge bg-danger shadow-sm">Sin stock</span>
          ) : product.stock <= 5 ? (
            <span className="badge bg-warning text-dark shadow-sm">¡Últimas {product.stock}!</span>
          ) : null}
        </div>
      </div>

      <div className="card-body d-flex flex-column p-3">
        <h3 className="h6 fw-bold mb-1 text-dark text-truncate" title={product.name}>
          {product.name}
        </h3>

        <p
          className="text-muted small mb-3 flex-grow-1"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={product.description || ''}
        >
          {product.description || 'Delicioso plato preparado con ingredientes frescos.'}
        </p>

        <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto gap-2">
          <span className="fw-bold fs-5 text-dark text-nowrap">{formattedPrice}</span>

          <button
            type="button"
            className={`btn btn-sm ${isActionDisabled ? 'btn-secondary disabled' : 'btn-primary'} px-3 rounded-pill text-nowrap flex-shrink-0`}
            disabled={isActionDisabled}
            onClick={handleAdd}
            aria-label={
              isUnavailable
                ? 'No disponible'
                : isOutOfStock
                ? 'Sin stock'
                : `Agregar ${product.name} al carrito`
            }
          >
            {isUnavailable ? (
              'No disponible'
            ) : isOutOfStock ? (
              'Sin stock'
            ) : (
              <>
                <i className="bi bi-plus-lg me-1" />
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
