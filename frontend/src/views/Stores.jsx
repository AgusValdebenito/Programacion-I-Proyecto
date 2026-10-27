import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { storeService } from '../services/storeService'
import { categories, getStoreCategory, getCategoryById } from '../utils/categoryUtils'
import { getImageUrl } from '../utils/imageUrl'
import FavoriteButton from '../components/FavoriteButton'

const GRADIENTS = ['fr-grad-1', 'fr-grad-2', 'fr-grad-3', 'fr-grad-4', 'fr-grad-5']

function getInitials(name) {
  if (!name) return 'FR'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function Stores() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('categoria')
  const urlSearchParam = searchParams.get('buscar') || searchParams.get('search') || ''

  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState(urlSearchParam)
  const [ordering, setOrdering] = useState('name')

  const activeCategoryId = categoryParam ? Number(categoryParam) : null

  const [prevUrlParam, setPrevUrlParam] = useState(urlSearchParam)

  // Sincronizar durante el render si el param de la URL cambia externamente (patrón oficial de React)
  if (prevUrlParam !== urlSearchParam) {
    setPrevUrlParam(urlSearchParam)
    setSearchQuery(urlSearchParam)
  }


  // Debounce de 300ms para reflejar la búsqueda en la URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentInUrl = searchParams.get('buscar') || searchParams.get('search') || ''
      if (searchQuery.trim() !== currentInUrl.trim()) {
        const nextParams = new URLSearchParams(searchParams)
        if (searchQuery.trim()) {
          nextParams.set('buscar', searchQuery.trim())
          nextParams.delete('search')
        } else {
          nextParams.delete('buscar')
          nextParams.delete('search')
        }
        setSearchParams(nextParams, { replace: true })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchParams, setSearchParams])

  const handleRetry = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await storeService.getStores()
      if (res && res.success) {
        setStores(res.data || [])
        setError(null)
      } else {
        setError(res?.error || 'Error al obtener el listado de tiendas.')
      }
    } catch {
      setError('Error de conexión con el servidor al cargar las tiendas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadStores = async () => {
      try {
        const res = await storeService.getStores()
        if (!isMounted) return
        if (res && res.success) {
          setStores(res.data || [])
          setError(null)
        } else {
          setError(res?.error || 'Error al obtener el listado de tiendas.')
        }
      } catch {
        if (isMounted) {
          setError('Error de conexión con el servidor al cargar las tiendas.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadStores()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSelectCategory = (catId) => {
    if (!catId || catId === 'all') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('categoria')
      setSearchParams(nextParams)
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams.entries()), categoria: String(catId) })
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setOrdering('name')
    setSearchParams(new URLSearchParams())
  }

  // Filtered and sorted store list
  const filteredStores = useMemo(() => {
    const list = stores.filter((store) => {
      // Category filter
      if (activeCategoryId) {
        const storeCat = getStoreCategory(store)
        if (storeCat !== activeCategoryId) {
          return false
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const nameMatch = store.name?.toLowerCase().includes(query)
        const descMatch = store.description?.toLowerCase().includes(query)
        if (!nameMatch && !descMatch) {
          return false
        }
      }

      return true
    })

    if (ordering === 'name') {
      return [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }
    if (ordering === '-name') {
      return [...list].sort((a, b) => (b.name || '').localeCompare(a.name || ''))
    }
    if (ordering === 'recent') {
      return [...list].sort((a, b) => (b.id || 0) - (a.id || 0))
    }
    return list
  }, [stores, activeCategoryId, searchQuery, ordering])


  const activeCategoryObj = activeCategoryId ? getCategoryById(activeCategoryId) : null

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb small mb-2">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none text-secondary">
                Inicio
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Tiendas y Comercios
            </li>
          </ol>
        </nav>

        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h1 className="h3 fw-bold text-dark mb-1">
              {activeCategoryObj ? (
                <>
                  <span className="me-2">{activeCategoryObj.emoji}</span>
                  {activeCategoryObj.title}
                </>
              ) : (
                'Explorar Comercios'
              )}
            </h1>
            <p className="text-secondary mb-0">
              {activeCategoryObj
                ? activeCategoryObj.subtitle
                : 'Encontrá tus restaurantes, supermercados, cafeterías y farmacias favoritas.'}
            </p>
          </div>

          {/* Search bar & Ordering */}
          <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
            <div className="position-relative" style={{ minWidth: '240px', maxWidth: '340px' }}>
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
                <i className="bi bi-search" />
              </span>
              <input
                type="text"
                className="form-control rounded-pill ps-5 pe-4 py-2 border shadow-sm"
                placeholder="Buscar tiendas o productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Buscar tiendas o productos"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-secondary text-decoration-none"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar búsqueda"
                >
                  <i className="bi bi-x-circle-fill" />
                </button>
              )}
            </div>

            <select
              className="form-select rounded-pill py-2 px-3 border shadow-sm text-secondary small"
              style={{ minWidth: '160px' }}
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              aria-label="Ordenar tiendas"
            >
              <option value="name">Nombre (A - Z)</option>
              <option value="-name">Nombre (Z - A)</option>
              <option value="recent">Más recientes</option>
            </select>
          </div>
        </div>
      </div>


      {/* Category Filter Chips */}
      <div className="mb-4 overflow-auto pb-2">
        <div className="d-flex align-items-center gap-2 flex-nowrap flex-md-wrap">
          <button
            type="button"
            className={`btn rounded-pill px-3 py-1 btn-sm fw-semibold text-nowrap ${
              !activeCategoryId ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => handleSelectCategory('all')}
          >
            🍽️ Todos
          </button>
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                className={`btn rounded-pill px-3 py-1 btn-sm fw-semibold text-nowrap ${
                  isActive ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => handleSelectCategory(cat.id)}
              >
                <span className="me-1">{cat.emoji}</span>
                {cat.title}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content State Handling */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5 my-5">
          <div className="spinner-border text-primary me-3" role="status">
            <span className="visually-hidden">Cargando tiendas...</span>
          </div>
          <span className="text-secondary fw-semibold">Cargando tiendas y comercios...</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-4 shadow-sm" role="alert">
          <div>
            <i className="bi bi-exclamation-triangle-fill me-2" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={handleRetry}
          >
            Reintentar
          </button>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="text-center py-5 px-3 bg-light rounded-4 border shadow-sm my-4">
          <i className="bi bi-search text-muted fs-1 mb-3 d-block" />
          <h2 className="h5 fw-bold text-dark mb-2">No encontramos comercios</h2>
          <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '420px' }}>
            No hay resultados que coincidan con los filtros aplicados
            {searchQuery ? ` para "${searchQuery}"` : ''}.
          </p>
          <button
            type="button"
            className="btn btn-primary rounded-pill px-4"
            onClick={handleClearFilters}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="d-flex align-items-center justify-content-between mb-3 text-secondary small">
            <span>
              Mostrando <strong>{filteredStores.length}</strong> {filteredStores.length === 1 ? 'comercio' : 'comercios'}
            </span>
          </div>

          <div className="row g-4">
            {filteredStores.map((store) => {
              const storeCatId = getStoreCategory(store)
              const storeCat = getCategoryById(storeCatId)
              const gradientClass = GRADIENTS[(store.id || 0) % GRADIENTS.length] || 'fr-grad-1'
              const initials = getInitials(store.name)

              return (
                <div className="col-12 col-md-6 col-lg-4" key={store.id}>
                  <Link
                    to={`/tiendas/${store.id}`}
                    className="text-decoration-none text-reset d-block h-100"
                    aria-label={`Ver ${store.name}`}
                  >
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden transition-hover">
                      {/* Banner / Store Logo */}
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

                      {/* Card Body */}
                      <div className="card-body p-4 d-flex flex-column">
                        <h2 className="h5 fw-bold text-dark mb-1">{store.name}</h2>
                        <p className="text-secondary small mb-3 flex-grow-1 line-clamp-2">
                          {store.description || 'Comercio adherido a FoodRush'}
                        </p>

                        <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                          <span className="text-success small fw-semibold">
                            <i className="bi bi-clock-fill me-1" />
                            25-40 min
                          </span>
                          <span className="btn btn-sm btn-outline-primary rounded-pill px-3">
                            Ver carta <i className="bi bi-arrow-right ms-1" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
