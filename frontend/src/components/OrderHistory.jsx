import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { orderService } from '../services/orderService'

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

function formatDate(isoString) {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return isoString
  }
}

const STATUS_MAP = {
  pending: { label: 'Pendiente', badgeClass: 'bg-warning text-dark' },
  preparing: { label: 'En preparación', badgeClass: 'bg-info text-dark' },
  delivering: { label: 'En reparto', badgeClass: 'bg-primary text-white' },
  delivered: { label: 'Entregado', badgeClass: 'bg-success text-white' },
  cancelled: { label: 'Cancelado', badgeClass: 'bg-secondary text-white' },
}

export default function OrderHistory() {
  const { getValidToken } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const reloadOrders = () => {
    setLoading(true)
    setError(null)
    setReloadKey((k) => k + 1)
  }

  useEffect(() => {
    let isMounted = true

    const loadOrders = async () => {
      try {
        const token = await getValidToken()
        if (!isMounted) return
        if (!token) {
          setError('Debes iniciar sesión para consultar tus pedidos.')
          return
        }

        const res = await orderService.getOrders(token)
        if (!isMounted) return
        if (res.success && Array.isArray(res.data)) {
          const sorted = [...res.data].sort((a, b) => (b.id || 0) - (a.id || 0))
          setOrders(sorted)
        } else {
          setError(res.error || 'No se pudieron cargar los pedidos.')
        }
      } catch {
        if (isMounted) {
          setError('Error de conexión al cargar el historial.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadOrders()

    return () => {
      isMounted = false
    }
  }, [getValidToken, reloadKey])

  const handleCancelOrder = async (orderId) => {
    setCancellingId(orderId)
    setSuccessMessage(null)
    try {
      const token = await getValidToken()
      if (!token) return

      const res = await orderService.updateOrderStatus(orderId, 'cancelled', token)
      if (res.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'cancelled' } : ord))
        )
        setSuccessMessage(`El pedido #${orderId} fue cancelado exitosamente.`)
        setTimeout(() => setSuccessMessage(null), 4000)
      } else {
        setError(res.error || 'No se pudo cancelar el pedido.')
        setTimeout(() => setError(null), 4000)
      }
    } catch {
      setError('Error al procesar la cancelación.')
      setTimeout(() => setError(null), 4000)
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
        <div className="spinner-border text-primary mx-auto mb-3" role="status">
          <span className="visually-hidden">Cargando pedidos...</span>
        </div>
        <p className="text-secondary mb-0">Cargando tu historial de pedidos...</p>
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
        <div className="alert alert-danger mb-3 rounded-3" role="alert">
          {error}
        </div>
        <div>
          <button type="button" className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={reloadOrders}>
            <i className="bi bi-arrow-clockwise me-1" />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
        <div className="text-muted opacity-50 display-1 mb-3">
          <i className="bi bi-bag-x" />
        </div>
        <h3 className="h5 fw-bold text-dark mb-2">Aún no realizaste ningún pedido</h3>
        <p className="text-muted small mb-4">
          Tus compras y órdenes finalizadas aparecerán aquí con su estado de cocina y reparto en tiempo real.
        </p>
        <div>
          <Link to="/" className="btn btn-primary rounded-pill px-4 py-2 shadow-sm">
            <i className="bi bi-shop me-2" />
            Explorar comercios
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column gap-3">
      {successMessage && (
        <div className="alert alert-success py-2 px-3 rounded-3 small d-flex align-items-center" role="status">
          <i className="bi bi-check-circle-fill me-2" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 px-3 rounded-3 small d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {error}
        </div>
      )}

      {orders.map((order) => {
        const statusConfig = STATUS_MAP[order.status] || {
          label: order.status,
          badgeClass: 'bg-secondary text-white',
        }
        const isPending = order.status === 'pending'
        const isCancelling = cancellingId === order.id

        return (
          <div key={order.id} className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pb-3 border-bottom gap-2">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h3 className="h6 fw-bold text-dark mb-0">Pedido #{order.id}</h3>
                  <span className={`badge rounded-pill px-3 py-1 fw-bold ${statusConfig.badgeClass}`}>
                    {statusConfig.label}
                  </span>
                </div>
                <small className="text-muted d-block">
                  {order.store_name && <strong className="text-dark me-2">{order.store_name}</strong>}
                  {formatDate(order.created_at)}
                </small>
                {order.delivery_address && (
                  <div className="small text-secondary mt-1">
                    <i className="bi bi-geo-alt-fill text-primary me-1" />
                    <span>{order.delivery_address}</span>
                    {order.payment_method && (
                      <span className="ms-2 badge bg-light text-dark border">
                        {order.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="text-sm-end">
                <span className="fs-5 fw-bold text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Lista de productos en la orden */}
            {Array.isArray(order.items) && order.items.length > 0 && (
              <div className="py-3 d-flex flex-column gap-1 small">
                {order.items.map((it) => (
                  <div key={it.id || it.product} className="d-flex justify-content-between text-secondary">
                    <span>
                      <strong className="text-dark">{it.quantity}x</strong> {it.product_name || 'Producto'}
                    </span>
                    <span>{formatCurrency(Number(it.unit_price) * it.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Acciones */}
            <div className="pt-2 d-flex justify-content-between align-items-center border-top">
              <span className="small text-muted">
                {isPending ? 'En cola para ser aceptado por la cocina' : 'Actualización automática'}
              </span>

              {isPending && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm rounded-pill px-3"
                  onClick={() => handleCancelOrder(order.id)}
                  disabled={isCancelling}
                  aria-label={`Cancelar pedido #${order.id}`}
                >
                  <i className="bi bi-x-circle me-1" />
                  {isCancelling ? 'Cancelando...' : 'Cancelar pedido'}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
