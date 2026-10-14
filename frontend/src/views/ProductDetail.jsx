import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { storeService } from '../services/storeService'
import { useCart } from '../hooks/useCart'
import { getImageUrl } from '../utils/imageUrl'

/**
 * Formatea valores en pesos argentinos.
 * @param {number|string} value
 * @returns {string}
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

/**
 * Vista individual de detalle de producto (TP9 - Paso 2: Catálogo y Detalle con URL params).
 */
export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart, clearCart } = useCart()

  const [product, setProduct] = useState(null)
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)

  const [addedMessage, setAddedMessage] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [conflictProduct, setConflictProduct] = useState(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      setLoading(true)
      setError(null)

      try {
        const prodRes = await productService.getProductById(id)
        if (!isMounted) return

        if (!prodRes.success || !prodRes.data) {
          setError(prodRes.error || 'El producto solicitado no fue encontrado.')
          setLoading(false)
          return
        }

        setProduct(prodRes.data)

        if (prodRes.data.store) {
          const storeRes = await storeService.getStoreById(prodRes.data.store)
          if (isMounted && storeRes.success) {
            setStore(storeRes.data)
          }
        }
      } catch {
        if (isMounted) {
          setError('Error de conexión al cargar el detalle del producto.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [id])

  const handleIncrement = () => {
    if (product && quantity < Math.min(10, product.stock)) {
      setQuantity((prev) => prev + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    const res = await addToCart(product, quantity)

    if (res.monoStoreConflict) {
      setConflictProduct(product)
      return
    }

    if (res.success) {
      setAddedMessage(`Se agregó "${product.name}" (${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}) al carrito`)
      setTimeout(() => setAddedMessage(null), 3000)
    } else if (res.error) {
      setActionError(res.error)
      setTimeout(() => setActionError(null), 4000)
    }
  }

  const handleResolveConflictAndAdd = async () => {
    if (!conflictProduct) return
    const prodToAdd = conflictProduct
    setConflictProduct(null)
    await clearCart()
    const res = await addToCart(prodToAdd, quantity)
    if (res.success) {
      setAddedMessage(`Se vació el carrito anterior y se agregaron ${quantity} x "${prodToAdd.name}"`)
      setTimeout(() => setAddedMessage(null), 3000)
    } else if (res.error) {
      setActionError(res.error)
      setTimeout(() => setActionError(null), 4000)
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando producto...</span>
          </div>
          <p className="text-secondary fw-semibold">Cargando detalles del producto...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-5" style={{ minHeight: '60vh' }}>
        <div className="alert alert-danger p-4 rounded-4 text-center max-w-600 mx-auto" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-1 text-danger d-block mb-3" />
          <h2 className="h5 fw-bold mb-2">{error || 'Producto no encontrado'}</h2>
          <p className="text-muted small mb-4">
            El plato o artículo no existe o no se encuentra disponible actualmente.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/tiendas" className="btn btn-outline-danger rounded-pill px-4">
              <i className="bi bi-arrow-left me-1" />
              Explorar Comercios
            </Link>
            <Link to="/" className="btn btn-danger rounded-pill px-4">
              Ir al Inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isOutOfStock = product.stock === 0
  const isUnavailable = !product.is_available
  const isActionDisabled = isOutOfStock || isUnavailable
  const resolvedImg = !imgError && product.image ? getImageUrl(product.image) : null

  return (
    <div className="container py-4">
      {/* Toast de Éxito */}
      {addedMessage && (
        <div
          className="alert alert-success position-fixed top-0 end-0 m-3 shadow-lg z-3"
          style={{ maxWidth: '350px' }}
          role="status"
        >
          <i className="bi bi-check-circle-fill me-2" />
          {addedMessage}
        </div>
      )}

      {/* Toast de Error */}
      {actionError && (
        <div
          className="alert alert-danger position-fixed top-0 end-0 m-3 shadow-lg z-3 d-flex align-items-center"
          style={{ maxWidth: '360px' }}
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5 flex-shrink-0" />
          <div>{actionError}</div>
        </div>
      )}

      {/* Modal Conflicto Mono-tienda */}
      {conflictProduct && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 p-2">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="bi bi-exclamation-triangle-fill text-warning me-2" />
                  Cambiar de comercio
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConflictProduct(null)}
                  aria-label="Cerrar modal"
                />
              </div>
              <div className="modal-body py-3">
                <p className="text-secondary mb-0">
                  Tu carrito ya contiene productos de otra tienda. En FoodRush cada pedido es exclusivo de un único comercio.
                  ¿Deseás vaciar el carrito actual para pedir en <strong>{store?.name || 'este comercio'}</strong>?
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-3"
                  onClick={() => setConflictProduct(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={handleResolveConflictAndAdd}
                >
                  Vaciar y agregar este plato
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">
              Inicio
            </Link>
          </li>
          {store && (
            <li className="breadcrumb-item">
              <Link to={`/tiendas/${store.id}`} className="text-decoration-none">
                {store.name}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Card Principal de Detalle */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="row g-0">
          {/* Foto del Producto */}
          <div className="col-12 col-md-6 bg-light d-flex align-items-center justify-content-center p-4" style={{ minHeight: '340px' }}>
            {resolvedImg ? (
              <img
                src={resolvedImg}
                alt={product.name}
                className="img-fluid rounded-4 object-fit-cover shadow-sm w-100"
                style={{ maxHeight: '420px' }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="text-secondary opacity-50 display-1 py-5">
                <i className="bi bi-egg-fried" />
              </div>
            )}
          </div>

          {/* Información y Compra */}
          <div className="col-12 col-md-6 p-4 p-lg-5 d-flex flex-column justify-content-between">
            <div>
              {store && (
                <Link
                  to={`/tiendas/${store.id}`}
                  className="text-decoration-none text-primary fw-semibold small mb-2 d-inline-block"
                >
                  <i className="bi bi-shop me-1" />
                  {store.name}
                </Link>
              )}

              <h1 className="h3 fw-bold text-dark mb-2">{product.name}</h1>

              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="fs-3 fw-bold text-primary">{formatCurrency(product.price)}</span>
                {isUnavailable ? (
                  <span className="badge bg-secondary">No disponible</span>
                ) : isOutOfStock ? (
                  <span className="badge bg-danger">Sin stock</span>
                ) : product.stock <= 5 ? (
                  <span className="badge bg-warning text-dark">¡Últimas {product.stock} unidades!</span>
                ) : (
                  <span className="badge bg-success-subtle text-success border border-success-subtle">
                    Stock disponible ({product.stock})
                  </span>
                )}
              </div>

              <p className="text-muted mb-4 lead fs-6">
                {product.description || 'Delicioso plato elaborado artesanalmente con ingredientes de primera calidad.'}
              </p>
            </div>

            {/* Controles de Compra */}
            <div className="pt-3 border-top">
              {!isActionDisabled && (
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="small fw-semibold text-secondary">Cantidad:</span>
                  <div className="input-group" style={{ width: '130px' }}>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      aria-label="Disminuir cantidad"
                    >
                      <i className="bi bi-dash" />
                    </button>
                    <span className="form-control text-center fw-bold py-1" style={{ userSelect: 'none' }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleIncrement}
                      disabled={quantity >= Math.min(10, product.stock)}
                      aria-label="Aumentar cantidad"
                    >
                      <i className="bi bi-plus" />
                    </button>
                  </div>
                  <span className="small text-muted">
                    Subtotal: <strong>{formatCurrency(Number(product.price) * quantity)}</strong>
                  </span>
                </div>
              )}

              <div className="d-flex flex-column flex-sm-row gap-2">
                <button
                  type="button"
                  className={`btn ${isActionDisabled ? 'btn-secondary disabled' : 'btn-primary'} py-2 px-4 rounded-pill shadow-sm flex-grow-1`}
                  disabled={isActionDisabled}
                  onClick={handleAddToCart}
                >
                  <i className="bi bi-cart-plus me-2" />
                  {isUnavailable
                    ? 'No disponible actualmente'
                    : isOutOfStock
                    ? 'Sin stock disponible'
                    : 'Agregar al carrito'}
                </button>
                {store && (
                  <Link
                    to={`/tiendas/${store.id}`}
                    className="btn btn-outline-secondary py-2 px-3 rounded-pill"
                  >
                    Ver comercio
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
