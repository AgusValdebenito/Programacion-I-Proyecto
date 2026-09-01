import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const { pathname } = useLocation()

  const items = [
    { icon: 'bi-house-door-fill', label: 'Inicio', to: '/' },
    { icon: 'bi-search', label: 'Explorar', to: '/explorar' },
    { icon: 'bi-clipboard', label: 'Pedidos', to: '/pedidos' },
    { icon: 'bi-person', label: 'Mi perfil', to: '/perfil' },
  ]

  return (
    <nav className="fr-bottom-nav d-md-none" aria-label="Navegación inferior">
      <div className="d-flex justify-content-around">
        {items.map((item) => {
          const isActive = pathname === item.to
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
