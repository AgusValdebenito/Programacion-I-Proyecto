import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useAddress } from '../hooks/useAddress'
import Logo from './Logo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const { addresses, activeAddress, selectAddress } = useAddress()
  const [showLocationMenu, setShowLocationMenu] = useState(false)
  const locationMenuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationMenuRef.current && !locationMenuRef.current.contains(e.target)) {
        setShowLocationMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
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
              {user && (
                <Link className="fr-nav-link" to="/perfil">
                  Mi perfil
                </Link>
              )}
              {user && (
                <Link className="fr-nav-link text-primary fw-semibold" to="/panel-tienda">
                  <i className="bi bi-shop me-1"></i>
                  {user.role === 'vendedor' || user.role === 'admin' ? 'Mi Tienda' : 'Abrir Tienda'}
                </Link>
              )}
            </nav>
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-light text-dark border d-none d-sm-inline-block">
                  <i className="bi bi-person-fill me-1 text-primary"></i>
                  {user.name || user.username || user.email}
                </span>
                <button type="button" className="fr-icon-btn" aria-label="Notificaciones">
                  <i className="bi bi-bell" />
                </button>
                <Link
                  to="/carrito"
                  className="fr-icon-btn position-relative"
                  aria-label="Carrito"
                >
                  <i className="bi bi-cart3" />
                  {itemCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {itemCount}
                      <span className="visually-hidden">productos en el carrito</span>
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger ms-1"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                >
                  <i className="bi bi-box-arrow-right me-1 d-none d-sm-inline"></i>
                  Salir
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-sm btn-outline-primary">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 pb-1 d-flex justify-content-center justify-content-md-start position-relative" ref={locationMenuRef}>
          <button
            type="button"
            className="fr-location-pill border-0 text-start d-inline-flex align-items-center cursor-pointer"
            onClick={() => setShowLocationMenu((prev) => !prev)}
            aria-expanded={showLocationMenu}
            aria-label="Seleccionar dirección de entrega"
          >
            <i className="bi bi-geo-alt-fill" />
            <span className="fw-semibold">{activeAddress?.label || 'Casa'}</span>
            <span className="opacity-75 d-none d-sm-inline text-truncate ms-1" style={{ maxWidth: '200px', fontSize: '0.85rem' }}>
              · {activeAddress?.address}
            </span>
            <i className="bi bi-chevron-down ms-1" style={{ fontSize: '0.75rem' }} />
          </button>

          {showLocationMenu && (
            <div
              className="card border-0 shadow-lg rounded-4 p-3 position-absolute top-100 start-0 mt-2 z-3 bg-white text-dark"
              style={{ width: '320px', maxWidth: '90vw' }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                <span className="small fw-bold text-secondary text-uppercase tracking-wide">
                  <i className="bi bi-geo-alt me-1 text-primary" />
                  Entregar en:
                </span>
                <Link
                  to="/perfil"
                  className="small text-primary text-decoration-none fw-semibold"
                  onClick={() => setShowLocationMenu(false)}
                >
                  Editar
                </Link>
              </div>

              <div className="d-flex flex-column gap-2 mb-2 max-h-200 overflow-auto">
                {addresses.map((item) => {
                  const isSelected = activeAddress?.id === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`btn text-start p-2 rounded-3 d-flex align-items-center justify-content-between ${
                        isSelected ? 'btn-primary-subtle border-primary text-primary fw-semibold' : 'btn-light text-dark'
                      }`}
                      onClick={() => {
                        selectAddress(item.id)
                        setShowLocationMenu(false)
                      }}
                    >
                      <div className="min-w-0 me-2">
                        <span className="d-block small fw-bold">{item.label}</span>
                        <small className="text-secondary d-block text-truncate" style={{ maxWidth: '240px' }}>
                          {item.address}
                        </small>
                      </div>
                      {isSelected && <i className="bi bi-check2 text-primary fs-5 flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>

              <div className="pt-2 border-top">
                <Link
                  to="/perfil"
                  className="btn btn-outline-primary btn-sm w-100 rounded-pill"
                  onClick={() => setShowLocationMenu(false)}
                >
                  <i className="bi bi-plus-circle me-1" />
                  Administrar direcciones
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
