import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'

/**
 * Componente interactivo desplegable de notificaciones para el Navbar (Milestone 7 - Issue #40).
 *
 * Muestra alertas contextuales según rol consumiendo el hook desacoplado `useNotifications`.
 */
export default function NotificationDropdown({ customNotifications = null }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const { notifications, unreadCount, readIds, markAllAsRead, markAsRead } =
    useNotifications(customNotifications)

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

  // Click en una notificación individual
  const handleNotificationClick = (notif) => {
    markAsRead(notif.id)
    setIsOpen(false)
    if (notif.link) {
      navigate(notif.link)
    }
  }

  const handleMarkAll = (e) => {
    e.stopPropagation()
    markAllAsRead()
  }

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
                onClick={handleMarkAll}
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
