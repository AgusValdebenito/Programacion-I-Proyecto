import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Logo from './Logo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="fr-navbar">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between py-2">
          <Logo />
          <div className="d-flex align-items-center">
            <nav className="d-none d-md-flex align-items-center gap-4 me-4" aria-label="Navegación principal">
              <Link className="fr-nav-link" to="/">
                Inicio
              </Link>
              <Link className="fr-nav-link" to="/explorar">
                Explorar
              </Link>
              <Link className="fr-nav-link" to="/tiendas">
                Tiendas
              </Link>
              <Link className="fr-nav-link" to="/perfil">
                Mi perfil
              </Link>
            </nav>
            {user && (
              <button type="button" className="fr-icon-btn" aria-label="Notificaciones">
                <i className="bi bi-bell" />
              </button>
            )}
            {user && (
              <button type="button" className="fr-icon-btn ms-2" aria-label="Carrito">
                <i className="bi bi-cart3" />
              </button>
            )}
            {user && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger ms-2"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
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
