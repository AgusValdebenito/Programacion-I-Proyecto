import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'

/**
 * Formatea valores numéricos en moneda argentina.
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

export default function Cart() {
  const {
    items,
    itemCount,
    totalAmount,
    loading,
    error,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart()

  const [processingId, setProcessingId] = useState(null)
  const [clearing, setClearing] = useState(false)
  const [itemError, setItemError] = useState(null)

  const handleUpdate = async (itemId, quantity) => {
    setProcessingId(itemId)
    setItemError(null)
    try {
      const res = await updateQuantity(itemId, quantity)
      if (res && !res.success && res.error) {
        setItemError(res.error)
      }
    } finally {
      setProcessingId(null)
    }
  }

  const handleRemove = async (itemId) => {
    setProcessingId(itemId)
    try {
      await removeItem(itemId)
    } finally {
      setProcessingId(null)
    }
  }

  const handleClear = async () => {
    setClearing(true)
    try {
      await clearCart()
    } finally {
      setClearing(false)
    }
  }

  if (loading && items.length === 0) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando carrito...</span>
          </div>
          <p className="text-secondary fw-semibold">Cargando tu carrito de compras...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="card border-0 shadow-sm rounded-4 p-5 max-w-600 mx-auto bg-white">
          <div className="text-muted opacity-50 display-1 mb-3">
            <i className="bi bi-cart-x" />
          </div>
          <h1 className="h3 fw-bold text-dark mb-2">Tu carrito está vacío</h1>
          <p className="text-muted mb-4">
            Parece que aún no agregaste ningún producto a tu pedido. Explorá nuestros comercios y deleitate con sus mejores platos.
          </p>
          <Link to="/" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
            <i className="bi bi-shop me-2" />
            Explorar comercios
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">
              Inicio
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Carrito de compras
          </li>
        </ol>
      </nav>

      {/* Alerta de error si surge */}
      {(error || itemError) && (
        <div className="alert alert-danger mb-4 rounded-3 d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          <span>{itemError || error}</span>
        </div>
      )}

      <div className="row g-4">
        {/* Listado de Productos */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-3">
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <div>
                <h1 className="h4 fw-bold text-dark mb-1">Tu Pedido</h1>
                <p className="text-muted small mb-0">
                  {itemCount} {itemCount === 1 ? 'producto' : 'productos'} en total
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                onClick={handleClear}
                disabled={clearing}
                aria-label="Vaciar carrito"
              >
                <i className="bi bi-trash me-1" />
                {clearing ? 'Vaciando...' : 'Vaciar carrito'}
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              {items.map((item) => {
                const product = item.product_details || {}
                const itemSubtotal = (Number(product.price) || 0) * item.quantity
                const isItemProcessing = processingId === item.id

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-3 border bg-light d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3"
                  >
                    <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name || 'Producto'}
                          className="rounded-3 object-fit-cover flex-shrink-0"
                          style={{ width: '64px', height: '64px' }}
                        />
                      ) : (
                        <div
                          className="bg-white rounded-3 border d-flex align-items-center justify-content-center text-secondary opacity-75 flex-shrink-0"
                          style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}
                        >
                          <i className="bi bi-egg-fried" />
                        </div>
                      )}

                      <div className="flex-grow-1 min-w-0">
                        <h2 className="h6 fw-bold text-dark mb-1 text-truncate">{product.name || 'Producto'}</h2>
                        <span className="text-muted small">
                          Precio unitario: {formatCurrency(product.price)}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3 pt-2 pt-sm-0 border-top border-sm-0 flex-nowrap flex-shrink-0">
                      {/* Controles de cantidad */}
                      <div className="input-group input-group-sm flex-nowrap" style={{ width: '120px' }}>
                        <button
                          type="button"
                          className="btn btn-outline-secondary px-2"
                          onClick={() => handleUpdate(item.id, item.quantity - 1)}
                          disabled={isItemProcessing}
                          aria-label="Reducir cantidad"
                        >
                          <i className="bi bi-dash" />
                        </button>
                        <span className="input-group-text bg-white fw-bold px-2 justify-content-center flex-grow-1">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary px-2"
                          onClick={() => handleUpdate(item.id, item.quantity + 1)}
                          disabled={
                            isItemProcessing ||
                            item.quantity >= 10 ||
                            (product.stock !== undefined && product.stock !== null && item.quantity >= product.stock)
                          }
                          aria-label="Aumentar cantidad"
                        >
                          <i className="bi bi-plus" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-end text-nowrap" style={{ minWidth: '90px' }}>
                        <span className="fw-bold text-dark">{formatCurrency(itemSubtotal)}</span>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        type="button"
                        className="btn btn-link text-danger p-1 flex-shrink-0"
                        onClick={() => handleRemove(item.id)}
                        disabled={isItemProcessing}
                        title="Eliminar producto"
                        aria-label="Eliminar producto"
                      >
                        <i className="bi bi-trash fs-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Resumen del Pedido (Sidebar) */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white position-sticky" style={{ top: '80px' }}>
            <h2 className="h5 fw-bold text-dark mb-3">Resumen del Pedido</h2>

            <div className="d-flex justify-content-between mb-2 text-secondary">
              <span>Subtotal ({itemCount} {itemCount === 1 ? 'ítem' : 'ítems'})</span>
              <span className="fw-semibold text-dark">{formatCurrency(totalAmount)}</span>
            </div>

            <div className="d-flex justify-content-between mb-3 text-secondary">
              <span>Costo de envío</span>
              <span className="text-success fw-semibold">Gratis</span>
            </div>

            <div className="border-top pt-3 d-flex justify-content-between align-items-center mb-4">
              <span className="fs-5 fw-bold text-dark">Total</span>
              <span className="fs-4 fw-bold text-primary">{formatCurrency(totalAmount)}</span>
            </div>

            <Link
              to="/checkout"
              className="btn btn-primary w-100 py-2 rounded-pill fw-semibold shadow-sm mb-3"
            >
              Confirmar pedido e ir a pagar
              <i className="bi bi-arrow-right ms-2" />
            </Link>

            <Link
              to="/"
              className="btn btn-outline-secondary w-100 py-2 rounded-pill small text-decoration-none"
            >
              <i className="bi bi-arrow-left me-1" />
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
