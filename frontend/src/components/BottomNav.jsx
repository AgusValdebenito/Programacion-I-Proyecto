export default function BottomNav() {
  const items = [
    { icon: 'bi-house-door-fill', label: 'Inicio', active: true },
    { icon: 'bi-search', label: 'Explorar', active: false },
    { icon: 'bi-clipboard', label: 'Pedidos', active: false },
    { icon: 'bi-person', label: 'Mi perfil', active: false },
  ]

  return (
    <nav className="fr-bottom-nav d-md-none" aria-label="Navegación inferior">
      <div className="d-flex justify-content-around">
        {items.map((item) => (
          <a key={item.label} href="#" className={item.active ? 'active' : ''}>
            <i className={`bi ${item.icon}`} />
            {item.label}
          </a>
        ))}
      </div>
      <div className="fr-home-indicator mx-auto" aria-hidden="true" />
    </nav>
  )
}