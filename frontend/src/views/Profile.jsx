import { Link, useLocation, useNavigate } from 'react-router-dom'
import ProfileInfo from '../components/ProfileInfo'
import OrderHistory from '../components/OrderHistory'
import FavoriteStores from '../components/FavoriteStores'

export default function Profile() {
  const location = useLocation()
  const navigate = useNavigate()

  // Sincronizar directamente con la ruta activa (single source of truth)
  const activeTab = location.pathname.includes('/pedidos')
    ? 'orders'
    : location.pathname.includes('/favoritos')
    ? 'favorites'
    : 'info'

  const handleTabChange = (tab) => {
    if (tab === 'orders') {
      navigate('/pedidos')
    } else if (tab === 'favorites') {
      navigate('/favoritos')
    } else {
      navigate('/perfil')
    }
  }

  const getBreadcrumbTitle = () => {
    if (activeTab === 'orders') return 'Mis Pedidos'
    if (activeTab === 'favorites') return 'Mis Favoritos'
    return 'Mi Perfil'
  }

  const getHeaderTitle = () => {
    if (activeTab === 'orders') return 'Mis Pedidos'
    if (activeTab === 'favorites') return 'Mis Tiendas Favoritas'
    return 'Mi Cuenta'
  }

  const getHeaderDescription = () => {
    if (activeTab === 'orders') {
      return 'Consultá el estado en tiempo real de tus pedidos y compras realizadas.'
    }
    if (activeTab === 'favorites') {
      return 'Tus comercios preferidos guardados para acceder rápidamente a sus cartas.'
    }
    return 'Gestioná tus datos personales y tus direcciones de entrega guardadas.'
  }

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
            {getBreadcrumbTitle()}
          </li>
        </ol>
      </nav>

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-2">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">{getHeaderTitle()}</h1>
          <p className="text-muted small mb-0">{getHeaderDescription()}</p>
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
              onClick={() => handleTabChange('info')}
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
              onClick={() => handleTabChange('orders')}
            >
              <i className="bi bi-receipt me-2" />
              Mis Pedidos
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              type="button"
              className={`nav-link border-0 fw-semibold px-4 py-3 rounded-top-4 ${
                activeTab === 'favorites'
                  ? 'active text-primary border-bottom border-primary border-3 bg-white shadow-sm'
                  : 'text-secondary'
              }`}
              role="tab"
              aria-selected={activeTab === 'favorites'}
              onClick={() => handleTabChange('favorites')}
            >
              <i className="bi bi-heart me-2" />
              Mis Favoritos
            </button>
          </li>
        </ul>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="tab-content">
        {activeTab === 'info' && <ProfileInfo />}
        {activeTab === 'orders' && <OrderHistory />}
        {activeTab === 'favorites' && <FavoriteStores />}
      </div>
    </div>
  )
}
