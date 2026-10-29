import { Link } from 'react-router-dom'
import { useFavorites } from '../hooks/useFavorites'
import FavoriteButton from './FavoriteButton'
import { getImageUrl } from '../utils/imageUrl'
import { getStoreCategory, getCategoryById } from '../utils/categoryUtils'

const GRADIENTS = ['fr-grad-1', 'fr-grad-2', 'fr-grad-3', 'fr-grad-4', 'fr-grad-5']

function getInitials(name) {
  if (!name) return 'FR'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function FavoriteStores() {
  const { favorites, loading } = useFavorites()

  if (loading && favorites.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary me-2" role="status">
          <span className="visually-hidden">Cargando favoritos...</span>
        </div>
        <span className="text-secondary fw-semibold">Cargando tus comercios favoritos...</span>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
        <div className="mb-3">
          <div
            className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center text-danger"
            style={{ width: '80px', height: '80px' }}
          >
            <i className="bi bi-heart fs-1" />
          </div>
        </div>
        <h2 className="h4 fw-bold text-dark mb-2">Todavía no tenés tiendas favoritas</h2>
        <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '460px' }}>
          Guardá tus restaurantes y comercios preferidos haciendo clic en el corazón (❤️) en el catálogo para tener acceso rápido a sus cartas y platos.
        </p>
        <div>
          <Link to="/tiendas" className="btn btn-primary rounded-pill px-4 py-2 shadow-sm">
            <i className="bi bi-shop me-2" />
            Explorar comercios
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="favorite-stores-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h5 fw-bold text-dark mb-1">
            <i className="bi bi-heart-fill text-danger me-2" />
            Comercios Guardados
          </h2>
          <p className="text-secondary small mb-0">
            Tenés <strong>{favorites.length}</strong> {favorites.length === 1 ? 'local favorito' : 'locales favoritos'}.
          </p>
        </div>
        <Link to="/tiendas" className="btn btn-sm btn-outline-primary rounded-pill px-3">
          <i className="bi bi-plus-lg me-1" />
          Agregar más
        </Link>
      </div>

      <div className="row g-4">
        {favorites.map((store) => {
          const storeCatId = getStoreCategory(store)
          const storeCat = getCategoryById(storeCatId)
          const gradientClass = GRADIENTS[(store.id || 0) % GRADIENTS.length] || 'fr-grad-1'
          const initials = getInitials(store.name)

          return (
            <div className="col-12 col-md-6 col-lg-4" key={store.id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                {/* Banner con logo y badge */}
                <div className={`p-4 d-flex align-items-center justify-content-between ${gradientClass}`}>
                  <div className="fr-store-logo bg-white text-dark shadow-sm overflow-hidden">
                    {store.image ? (
                      <img
                        className="fr-store-logo-img w-100 h-100 object-fit-cover"
                        src={getImageUrl(store.image)}
                        alt={store.name}
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {storeCat && (
                      <span className="badge bg-white text-dark shadow-sm rounded-pill px-3 py-2 fw-semibold">
                        <span className="me-1">{storeCat.emoji}</span>
                        {storeCat.title}
                      </span>
                    )}
                    <FavoriteButton store={store} size="sm" />
                  </div>
                </div>

                {/* Cuerpo de la tarjeta */}
                <div className="card-body p-4 d-flex flex-column">
                  <h3 className="h5 fw-bold text-dark mb-1">{store.name}</h3>
                  <p className="text-secondary small mb-3 flex-grow-1 line-clamp-2">
                    {store.description || 'Comercio adherido a FoodRush'}
                  </p>

                  <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                    <span className="text-success small fw-semibold">
                      <i className="bi bi-clock-fill me-1" />
                      25-40 min
                    </span>
                    <Link
                      to={`/tiendas/${store.id}`}
                      className="btn btn-sm btn-primary rounded-pill px-3"
                    >
                      Ver carta <i className="bi bi-arrow-right ms-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
