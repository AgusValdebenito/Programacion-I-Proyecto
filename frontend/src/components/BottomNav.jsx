export default function BottomNav() {
  const items = [
    { icon: 'bi-house-door-fill', label: 'Inicio', href: '#inicio', active: true },
    { icon: 'bi-search', label: 'Explorar', href: '#categorias', active: false },
    { icon: 'bi-clipboard', label: 'Pedidos', href: '#', active: false },
    { icon: 'bi-person', label: 'Mi perfil', href: '#', active: false },
  ]

  return (
    <nav className="fr-bottom-nav d-md-none" aria-label="Navegación inferior">
      <div className="d-flex justify-content-around">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={item.active ? 'active' : ''}
            aria-current={item.active ? 'page' : undefined}
          >
            <i className={`bi ${item.icon}`} />
            {item.label}
          </a>
        ))}
      </div>
      <div className="fr-home-indicator mx-auto" aria-hidden="true" />
    </nav>
  )
}