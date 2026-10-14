import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="fr-footer d-none d-md-block mt-5">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="mb-2">
              <Logo />
            </div>
            <p className="small mb-0">
              Pedidos online de restaurantes, supermercados, cafeterías y más.
            </p>
          </div>
          <div className="col-6 col-md-4">
            <h5 className="fw-semibold mb-3">Navegación</h5>
            <ul className="list-unstyled small d-grid gap-2 mb-0">
              <li>
                <Link to="/">Inicio</Link>
              </li>
              <li>
                <Link to="/explorar">Explorar comercios</Link>
              </li>
              <li>
                <Link to="/tiendas">Tiendas destacadas</Link>
              </li>
              <li>
                <Link to="/carrito">Mi carrito</Link>
              </li>
            </ul>
          </div>
          <div className="col-6 col-md-4">
            <h5 className="fw-semibold mb-3">Mi Cuenta</h5>
            <ul className="list-unstyled small d-grid gap-2 mb-0">
              <li>
                <Link to="/pedidos">Mis pedidos</Link>
              </li>
              <li>
                <Link to="/perfil">Mi perfil</Link>
              </li>
              <li>
                <Link to="/perfil">Direcciones guardadas</Link>
              </li>
            </ul>
          </div>
        </div>
        <hr className="border-white opacity-25 my-4" />
        <p className="small text-center mb-0 opacity-75">© 2026 FoodRush · Proyecto educativo</p>
      </div>
    </footer>
  )
}
