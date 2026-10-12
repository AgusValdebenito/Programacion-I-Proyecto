import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useAddress } from '../hooks/useAddress'

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

export default function Checkout() {
  const { items, itemCount, totalAmount, checkout } = useCart()
  const { user } = useAuth()
  const { activeAddress } = useAddress()

  const [address, setAddress] = useState(() => activeAddress?.address || '')
  const [phone, setPhone] = useState(() => user?.phone || '')
  const [hasUserEditedAddress, setHasUserEditedAddress] = useState(false)
  const [hasUserEditedPhone, setHasUserEditedPhone] = useState(false)
  const [prevActiveAddress, setPrevActiveAddress] = useState(activeAddress?.address)
  const [prevUserPhone, setPrevUserPhone] = useState(user?.phone)
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)
  const [completedOrder, setCompletedOrder] = useState(null)

  if (!hasUserEditedAddress && activeAddress?.address && activeAddress.address !== prevActiveAddress) {
    setPrevActiveAddress(activeAddress.address)
    setAddress(activeAddress.address)
  }

  if (!hasUserEditedPhone && user?.phone && user.phone !== prevUserPhone) {
    setPrevUserPhone(user.phone)
    setPhone(user.phone)
  }

  const validate = () => {
    const errors = {}
    if (!address.trim()) {
      errors.address = 'Ingresá la dirección de entrega.'
    }
    if (!phone.trim()) {
      errors.phone = 'Ingresá un teléfono de contacto.'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCheckoutError(null)

    if (!validate()) {
      return
    }

    setSubmitting(true)
    try {
      const res = await checkout()
      if (res && res.success) {
        setCompletedOrder(res.data)
      } else {
        setCheckoutError(res?.error || 'No se pudo completar el pedido. Intentá nuevamente.')
      }
    } catch {
      setCheckoutError('Error de conexión al procesar el pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  // Pantalla de Confirmación Exitosa
  if (completedOrder) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '65vh' }}>
        <div className="card border-0 shadow-sm rounded-4 p-5 max-w-600 mx-auto bg-white">
          <div className="text-success mb-3">
            <i className="bi bi-check-circle-fill display-1" />
          </div>
          <h1 className="h3 fw-bold text-dark mb-2">¡Pedido confirmado con éxito!</h1>
          <p className="text-muted mb-4">
            Tu pedido <strong className="text-dark">#{completedOrder.id}</strong> ha sido enviado a la cocina de{' '}
            <strong className="text-dark">{completedOrder.store_name || 'la tienda'}</strong>.
          </p>

          <div className="card bg-light border-0 rounded-3 p-3 text-start mb-4">
            <div className="d-flex justify-content-between mb-2 small text-secondary">
              <span>Estado del pedido:</span>
              <span className="badge bg-warning text-dark fw-bold">Pendiente</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small text-secondary">
              <span>Tiempo estimado:</span>
              <span className="fw-semibold text-dark">25 - 40 minutos</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small text-secondary">
              <span>Método de pago:</span>
              <span className="fw-semibold text-dark">
                {paymentMethod === 'cash' ? 'Efectivo al recibir' : 'Tarjeta (simulada)'}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2 small text-secondary">
              <span>Dirección:</span>
              <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: '200px' }}>
                {address}
              </span>
            </div>
            <div className="d-flex justify-content-between pt-2 border-top small text-secondary">
              <span className="fw-bold text-dark">Total:</span>
              <span className="fw-bold text-primary fs-6">{formatCurrency(completedOrder.total || totalAmount)}</span>
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
            <Link to="/pedidos" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
              <i className="bi bi-receipt me-2" />
              Ver mis pedidos
            </Link>
            <Link to="/" className="btn btn-outline-secondary px-4 py-2 rounded-pill">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Carrito vacío
  if (items.length === 0) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="card border-0 shadow-sm rounded-4 p-5 max-w-600 mx-auto bg-white">
          <div className="text-muted opacity-50 display-1 mb-3">
            <i className="bi bi-cart-x" />
          </div>
          <h1 className="h4 fw-bold text-dark mb-2">No tenés productos en tu carrito</h1>
          <p className="text-muted mb-4">
            Agregá algún plato o producto de tu comercio favorito para poder finalizar la compra.
          </p>
          <Link to="/" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
            <i className="bi bi-shop me-2" />
            Ir a la tienda
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
          <li className="breadcrumb-item">
            <Link to="/carrito" className="text-decoration-none">
              Carrito
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Finalizar compra
          </li>
        </ol>
      </nav>

      <h1 className="h3 fw-bold text-dark mb-4">Finalizar compra</h1>

      {checkoutError && (
        <div className="alert alert-danger rounded-3 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5 flex-shrink-0" />
          <div>{checkoutError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">
          {/* Columna Izquierda: Datos de Entrega y Pago */}
          <div className="col-12 col-lg-7">
            {/* Card: Datos de Entrega */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h2 className="h5 fw-bold text-dark mb-3">
                <i className="bi bi-geo-alt-fill text-primary me-2" />
                Datos de Entrega
              </h2>

              <div className="mb-3">
                <label htmlFor="delivery-address" className="form-label fw-semibold text-secondary small">
                  Dirección de entrega *
                </label>
                <input
                  type="text"
                  id="delivery-address"
                  className={`form-control rounded-3 ${fieldErrors.address ? 'is-invalid' : ''}`}
                  placeholder="Ej: Av. Corrientes 1234, Piso 4 Depto B"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    setHasUserEditedAddress(true)
                    if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: null }))
                  }}
                />
                {fieldErrors.address && <div className="invalid-feedback">{fieldErrors.address}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="delivery-phone" className="form-label fw-semibold text-secondary small">
                  Teléfono de contacto *
                </label>
                <input
                  type="tel"
                  id="delivery-phone"
                  className={`form-control rounded-3 ${fieldErrors.phone ? 'is-invalid' : ''}`}
                  placeholder="Ej: 11 3456-7890"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setHasUserEditedPhone(true)
                    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: null }))
                  }}
                />
                {fieldErrors.phone && <div className="invalid-feedback">{fieldErrors.phone}</div>}
              </div>

              <div>
                <label htmlFor="delivery-notes" className="form-label fw-semibold text-secondary small">
                  Aclaraciones o notas (opcional)
                </label>
                <textarea
                  id="delivery-notes"
                  rows="2"
                  className="form-control rounded-3"
                  placeholder="Ej: El timbre no anda, llamar al llegar. Sin cebolla."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Card: Método de Pago */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h2 className="h5 fw-bold text-dark mb-3">
                <i className="bi bi-credit-card-2-front-fill text-primary me-2" />
                Método de Pago
              </h2>

              <div className="d-flex flex-column gap-2 mb-3">
                <label
                  className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${
                    paymentMethod === 'cash' ? 'border-primary bg-light' : 'bg-white'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="form-check-input mt-0"
                    />
                    <div>
                      <span className="fw-semibold text-dark d-block">Efectivo al recibir</span>
                      <small className="text-muted">Abonás en efectivo cuando el repartidor llega.</small>
                    </div>
                  </div>
                  <i className="bi bi-cash-coin fs-4 text-success" />
                </label>

                <label
                  className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${
                    paymentMethod === 'card' ? 'border-primary bg-light' : 'bg-white'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="form-check-input mt-0"
                    />
                    <div>
                      <span className="fw-semibold text-dark d-block">Tarjeta de débito / crédito</span>
                      <small className="text-muted">Cobro online simulado para la entrega.</small>
                    </div>
                  </div>
                  <i className="bi bi-credit-card fs-4 text-primary" />
                </label>
              </div>

              <div className="alert alert-info border-0 rounded-3 small py-2 px-3 mb-0 d-flex align-items-center">
                <i className="bi bi-info-circle-fill me-2 fs-5 flex-shrink-0" />
                <span>
                  <strong>Entorno Académico:</strong> La pasarela de pago es una simulación para el Trabajo Práctico.
                  No se realizarán cobros reales.
                </span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resumen de la Orden */}
          <div className="col-12 col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white position-sticky" style={{ top: '80px' }}>
              <h2 className="h5 fw-bold text-dark mb-3">Resumen de la Orden</h2>

              <div className="d-flex flex-column gap-2 mb-3 max-h-300 overflow-auto">
                {items.map((item) => {
                  const product = item.product_details || {}
                  const subtotal = (Number(product.price) || 0) * item.quantity
                  return (
                    <div key={item.id} className="d-flex align-items-center justify-content-between small py-2 border-bottom">
                      <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
                        <span className="badge bg-light text-dark border px-2 py-1 rounded-pill flex-shrink-0">
                          {item.quantity}x
                        </span>
                        <span className="text-dark fw-medium text-truncate">{product.name || 'Producto'}</span>
                      </div>
                      <span className="fw-semibold text-dark text-nowrap ms-2">{formatCurrency(subtotal)}</span>
                    </div>
                  )
                })}
              </div>

              <div className="d-flex justify-content-between mb-2 text-secondary small">
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})</span>
                <span className="fw-semibold text-dark">{formatCurrency(totalAmount)}</span>
              </div>

              <div className="d-flex justify-content-between mb-3 text-secondary small">
                <span>Costo de envío</span>
                <span className="text-success fw-semibold">Gratis</span>
              </div>

              <div className="border-top pt-3 d-flex justify-content-between align-items-center mb-4">
                <span className="fs-5 fw-bold text-dark">Total</span>
                <span className="fs-4 fw-bold text-primary">{formatCurrency(totalAmount)}</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-3 rounded-pill fw-semibold shadow-sm mb-3"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Procesando pedido...
                  </>
                ) : (
                  <>
                    <i className="bi bi-bag-check-fill me-2" />
                    Confirmar y Realizar Pedido
                  </>
                )}
              </button>

              <Link
                to="/carrito"
                className="btn btn-outline-secondary w-100 py-2 rounded-pill small text-decoration-none"
              >
                <i className="bi bi-arrow-left me-1" />
                Modificar carrito
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
