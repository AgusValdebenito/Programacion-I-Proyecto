import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ProfileInfo from '../components/ProfileInfo'
import OrderHistory from '../components/OrderHistory'

export default function Profile() {
  const location = useLocation()
  const initialTab = location.pathname.includes('/pedidos') ? 'orders' : 'info'
  const [activeTab, setActiveTab] = useState(initialTab)

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">
              Inicio
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Mi Perfil
          </li>
        </ol>
      </nav>

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-2">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">Mi Cuenta</h1>
          <p className="text-muted small mb-0">Gestioná tus datos, direcciones de entrega y consultá tus pedidos.</p>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="border-bottom mb-4">
        <ul className="nav nav-tabs border-0 gap-2" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              type="button"
              className={`nav-link border-0 fw-semibold px-4 py-3 rounded-top-4 ${
                activeTab === 'info'
                  ? 'active text-primary border-bottom border-primary border-3 bg-white shadow-sm'
                  : 'text-secondary'
              }`}
              role="tab"
              aria-selected={activeTab === 'info'}
              onClick={() => setActiveTab('info')}
            >
              <i className="bi bi-person-gear me-2" />
              Datos y Direcciones
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              type="button"
              className={`nav-link border-0 fw-semibold px-4 py-3 rounded-top-4 ${
                activeTab === 'orders'
                  ? 'active text-primary border-bottom border-primary border-3 bg-white shadow-sm'
                  : 'text-secondary'
              }`}
              role="tab"
              aria-selected={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
            >
              <i className="bi bi-receipt me-2" />
              Mis Pedidos
            </button>
          </li>
        </ul>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="tab-content">
        {activeTab === 'info' && <ProfileInfo />}
        {activeTab === 'orders' && <OrderHistory />}
      </div>
    </div>
  )
}
