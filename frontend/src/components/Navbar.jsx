import Logo from './Logo'

export default function Navbar() {
  return (
    <header className="fr-navbar">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between py-2">
          <Logo />
          <div className="d-flex align-items-center">
            <nav className="d-none d-md-flex align-items-center gap-4 me-4" aria-label="Navegación principal">
              <a className="fr-nav-link" href="#inicio">
                Inicio
              </a>
              <a className="fr-nav-link" href="#categorias">
                Explorar
              </a>
              <a className="fr-nav-link" href="#tiendas">
                Tiendas
              </a>
              <a className="fr-nav-link" href="#">
                Mi perfil
              </a>
            </nav>
            <button type="button" className="fr-icon-btn" aria-label="Notificaciones">
              <i className="bi bi-bell" />
            </button>
            <button type="button" className="fr-icon-btn ms-2" aria-label="Carrito">
              <i className="bi bi-cart3" />
            </button>
          </div>
        </div>

        <div className="pt-3 pb-1 d-flex justify-content-center justify-content-md-start">
          <div className="fr-location-pill">
            <i className="bi bi-geo-alt-fill" />
            <span>Casa</span>
            <i className="bi bi-chevron-down" />
          </div>
        </div>
      </div>
    </header>
  )
}
