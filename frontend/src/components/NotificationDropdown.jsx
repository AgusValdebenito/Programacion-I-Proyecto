import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { orderService } from '../services/orderService'
import { storeService } from '../services/storeService'

/**
 * Componente interactivo desplegable de notificaciones para el Navbar (Milestone 7 - Issue #40).
 *
 * Muestra alertas contextuales según rol:
 * - Clientes: pedidos en preparación, en reparto o entregados pendientes de calificación.
 * - Vendedores: nuevos pedidos en cocina (status === 'pending') y alertas de stock.
 *
 * Incluye badge numérico reactivo, "Marcar todas como leídas" y persistencia en localStorage.
 */
export default function NotificationDropdown({ customNotifications = null }) {
  const { user, getValidToken } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [internalNotifications, setInternalNotifications] = useState([])
  const notifications = customNotifications || internalNotifications

  const [readIds, setReadIds] = useState(() => {
    if (!user?.id) return []
    try {
      const stored = localStorage.getItem(`foodrush_read_notifications_${user.id}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Sincronizar storage key cuando cambia el usuario
  const storageKey = user?.id ? `foodrush_read_notifications_${user.id}` : null

  // Cargar notificaciones dinámicas de manera asíncrona
  useEffect(() => {
    if (customNotifications) return
    let isMounted = true

    const loadNotifications = async () => {
      if (!user || !getValidToken) return

      try {
        const token = await getValidToken()
        if (!token || !isMounted) return

        const notifs = []

        // 1. Notificaciones como cliente (órdenes activas o entregadas recientes)
        const ordersRes = await orderService.getOrders(token)
        if (!isMounted) return

        if (ordersRes.success && Array.isArray(ordersRes.data)) {
          for (const order of ordersRes.data) {
            if (order.status === 'preparing') {
              notifs.push({
                id: `client-preparing-${order.id}`,
                type: 'order_preparing',
                title: `Pedido #${order.id} en preparación`,
                message: `Tu pedido en ${order.store_name || 'el local'} se está cocinando.`,
                icon: 'bi-fire',
                iconBgClass: 'bg-warning-subtle text-warning',
                link: '/pedidos',
                orderId: order.id,
              })
            } else if (order.status === 'delivering') {
              notifs.push({
                id: `client-delivering-${order.id}`,
                type: 'order_delivering',
                title: `¡Pedido #${order.id} en camino!`,
                message: `El repartidor va hacia tu domicilio con tu orden.`,
                icon: 'bi-bicycle',
                iconBgClass: 'bg-primary-subtle text-primary',
                link: '/pedidos',
                orderId: order.id,
              })
            } else if (order.status === 'delivered' && !order.rating) {
              notifs.push({
                id: `client-delivered-${order.id}`,
                type: 'order_delivered',
                title: `Pedido #${order.id} entregado`,
                message: `¿Qué tal estuvo tu pedido en ${order.store_name || 'el local'}? ¡Calificá tu experiencia!`,
                icon: 'bi-star-fill',
                iconBgClass: 'bg-warning-subtle text-warning',
                link: '/pedidos',
                orderId: order.id,
              })
            }
          }
        }

        // 2. Notificaciones para vendedores (órdenes pendientes en cocina)
        if (user.role === 'vendedor' || user.role === 'admin') {
          const storeRes = await storeService.getMyStore(token)
          if (!isMounted) return

          if (storeRes.success && storeRes.data?.id) {
            const storeId = storeRes.data.id
            const kitchenOrdersRes = await orderService.getStoreOrders(storeId, token)
            if (!isMounted) return

            if (kitchenOrdersRes.success && Array.isArray(kitchenOrdersRes.data)) {
              const pendingOrders = kitchenOrdersRes.data.filter((o) => o.status === 'pending')
              for (const pOrder of pendingOrders) {
                notifs.push({
                  id: `vendor-pending-${pOrder.id}`,
                  type: 'kitchen_order',
                  title: `Nuevo pedido entrante #${pOrder.id}`,
                  message: `Tenés una nueva comanda esperando confirmación en cocina.`,
                  icon: 'bi-bell-fill',
                  iconBgClass: 'bg-danger-subtle text-danger',
                  link: '/panel-tienda',
                  orderId: pOrder.id,
                })
              }
            }
          }
        }

        if (isMounted) {
          setInternalNotifications(notifs)
        }
      } catch {
        // Ignorar fallas silenciosas en la barra de notificaciones
      }
    }

    loadNotifications()

    return () => {
      isMounted = false
    }
  }, [user, getValidToken, customNotifications])

  // Cierre al hacer click afuera o presionar Escape
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Marcar todas como leídas
  const handleMarkAllAsRead = (e) => {
    e.stopPropagation()
    const allIds = notifications.map((n) => n.id)
    const updated = Array.from(new Set([...readIds, ...allIds]))
    setReadIds(updated)
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated))
      } catch {
        // Ignorar errores de quota de almacenamiento
      }
    }
  }

  // Click en una notificación individual
  const handleNotificationClick = (notif) => {
    if (!readIds.includes(notif.id)) {
      const updated = [...readIds, notif.id]
      setReadIds(updated)
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated))
        } catch {
          // Ignorar
        }
      }
    }
    setIsOpen(false)
    if (notif.link) {
      navigate(notif.link)
    }
  }

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        type="button"
        className="fr-icon-btn position-relative"
        aria-label="Notificaciones"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <i className="bi bi-bell" />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            data-testid="notification-badge"
            style={{ fontSize: '0.65rem' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
            <span className="visually-hidden">notificaciones no leídas</span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="dropdown-menu dropdown-menu-end show shadow-lg border-0 rounded-4 p-0 mt-2 position-absolute end-0"
          style={{ width: '330px', maxWidth: '92vw', zIndex: 1050 }}
          role="region"
          aria-label="Panel de notificaciones"
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light rounded-top-4">
            <div className="d-flex align-items-center gap-2">
              <h6 className="mb-0 fw-bold text-dark">Notificaciones</h6>
              {unreadCount > 0 && (
                <span className="badge bg-primary-subtle text-primary rounded-pill small">
                  {unreadCount} nueva{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                style={{ fontSize: '0.78rem' }}
                onClick={handleMarkAllAsRead}
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* Listado de Notificaciones */}
          <div
            className="list-group list-group-flush overflow-auto"
            style={{ maxHeight: '340px' }}
          >
            {notifications.length === 0 ? (
              <div
                className="text-center p-4 text-muted"
                data-testid="notifications-empty"
              >
                <i
                  className="bi bi-bell-slash fs-2 d-block mb-2 text-secondary opacity-50"
                  aria-hidden="true"
                />
                <p className="small mb-0">No tenés notificaciones pendientes</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isRead = readIds.includes(notif.id)
                return (
                  <button
                    key={notif.id}
                    type="button"
                    className={`list-group-item list-group-item-action text-start p-3 border-bottom border-light d-flex align-items-start gap-3 ${
                      !isRead ? 'bg-primary-subtle bg-opacity-10' : ''
                    }`}
                    onClick={() => handleNotificationClick(notif)}
                    data-testid={`notification-item-${notif.id}`}
                  >
                    <div
                      className={`rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0 ${
                        notif.iconBgClass || 'bg-light text-primary'
                      }`}
                      style={{ width: '36px', height: '36px' }}
                    >
                      <i className={`bi ${notif.icon || 'bi-info-circle'} fs-6`} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong
                          className="text-dark small text-truncate d-block"
                          style={{ maxWidth: '180px' }}
                        >
                          {notif.title}
                        </strong>
                        {!isRead && (
                          <span
                            className="badge bg-primary p-1 rounded-circle"
                            style={{ width: 6, height: 6 }}
                            aria-label="No leída"
                          />
                        )}
                      </div>
                      <p
                        className="text-secondary small mb-0 lh-sm"
                        style={{ fontSize: '0.82rem' }}
                      >
                        {notif.message}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-top bg-light text-center rounded-bottom-4">
            <button
              type="button"
              className="btn btn-link btn-sm text-decoration-none text-primary fw-semibold"
              style={{ fontSize: '0.82rem' }}
              onClick={() => {
                setIsOpen(false)
                navigate(user?.role === 'vendedor' ? '/panel-tienda' : '/pedidos')
              }}
            >
              {user?.role === 'vendedor'
                ? 'Ir al panel de cocina'
                : 'Ver historial de pedidos'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
