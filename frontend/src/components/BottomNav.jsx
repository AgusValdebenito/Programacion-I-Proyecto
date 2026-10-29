import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function BottomNav() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const isPureVendor =
    user?.role === 'vendedor' &&
    !(user?.role === 'admin' || Boolean(user?.is_staff) || Boolean(user?.is_superuser))

  if (isPureVendor || pathname.startsWith('/panel-tienda')) {
    return null
  }

  const items = [
    { icon: 'bi-house-door-fill', label: 'Inicio', to: '/' },
    { icon: 'bi-search', label: 'Explorar', to: '/explorar' },
    { icon: 'bi-clipboard', label: 'Pedidos', to: '/pedidos' },
    { icon: 'bi-person', label: 'Mi perfil', to: '/perfil' },
  ]

  const isItemActive = (to) => {
    if (to === '/explorar') return pathname === '/explorar' || pathname.startsWith('/tiendas')
    return pathname === to
  }

  return (
    <nav className="fr-bottom-nav d-md-none" aria-label="Navegación inferior">
      <div className="d-flex justify-content-around">
        {items.map((item) => {
          const isActive = isItemActive(item.to)
          return (
            <Link
              key={item.label}
              to={item.to}
              className={isActive ? 'active' : ''}
              aria-current={isActive ? 'page' : undefined}
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </Link>
          )
        })}
      </div>
      <div className="fr-home-indicator mx-auto" aria-hidden="true" />
    </nav>
  )
}
