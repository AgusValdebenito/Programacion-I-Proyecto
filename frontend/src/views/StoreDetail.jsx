import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { storeService } from '../services/storeService'
import { productService } from '../services/productService'
import ProductCard from '../components/ProductCard'

/**
 * Obtiene las iniciales de la tienda si no cuenta con imagen.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) return 'FR'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function StoreDetail() {
  const { id } = useParams()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addedItemMessage, setAddedItemMessage] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadStoreAndProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        const [storeRes, productsRes] = await Promise.all([
          storeService.getStoreById(id),
          productService.getProducts({ store: id }),
        ])

        if (!isMounted) return

        if (!storeRes.success) {
          setError(storeRes.error || 'No se pudo cargar la información de la tienda')
          setLoading(false)
          return
        }

        setStore(storeRes.data)

        if (productsRes.success) {
          setProducts(productsRes.data || [])
        } else {
          setProducts([])
        }
      } catch {
        if (isMounted) {
          setError('Error de conexión al cargar la tienda')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadStoreAndProducts()

    return () => {
      isMounted = false
    }
  }, [id])

  const handleAddToCart = (product) => {
    // Feedback visual inmediato (se conectará a CartContext en la Issue #15)
    setAddedItemMessage(`Se agregó "${product.name}" al carrito`)
    setTimeout(() => {
      setAddedItemMessage(null)
    }, 3000)
  }

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando carta...</span>
          </div>
          <p className="text-secondary fw-semibold">Cargando carta y menú del comercio...</p>
        </div>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="container py-5" style={{ minHeight: '60vh' }}>
        <div className="alert alert-danger p-4 rounded-3 text-center max-w-600 mx-auto" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-1 text-danger d-block mb-3" />
          <h2 className="h5 fw-bold">{error || 'Tienda no encontrada'}</h2>
          <p className="text-muted small mb-4">
            El comercio solicitado no existe o no se encuentra disponible actualmente.
          </p>
          <Link to="/" className="btn btn-outline-danger">
            <i className="bi bi-arrow-left me-1" />
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const initials = getInitials(store.name)

  return (
    <div className="container py-4">
      {/* Toast de notificación temporal */}
      {addedItemMessage && (
        <div
          className="alert alert-success position-fixed top-0 end-0 m-3 shadow-lg z-3"
          style={{ maxWidth: '350px' }}
          role="status"
        >
          <i className="bi bi-check-circle-fill me-2" />
          {addedItemMessage}
        </div>
      )}

      {/* Navegación y Header del Comercio */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">
              Inicio
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {store.name}
          </li>
        </ol>
      </nav>

      <header className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-sm-row align-items-center gap-4">
          <div
            className="fr-store-logo fr-grad-1 flex-shrink-0 d-flex align-items-center justify-content-center"
            style={{ width: '80px', height: '80px', fontSize: '1.75rem' }}
          >
            {store.image ? (
              <img src={store.image} alt={store.name} className="fr-store-logo-img" />
            ) : (
              initials
            )}
          </div>

          <div className="text-center text-sm-start flex-grow-1">
            <h1 className="h3 fw-bold mb-1 text-dark">{store.name}</h1>
            <p className="text-muted mb-2">
              {store.description || 'Comercio gastronómico adherido a FoodRush.'}
            </p>
            <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-sm-start">
              <span className="badge bg-light text-dark border">
                <i className="bi bi-clock me-1 text-primary" />
                25 - 40 min
              </span>
              <span className="badge bg-light text-dark border">
                <i className="bi bi-bicycle me-1 text-success" />
                Envío disponible
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Sección de Productos / Carta */}
      <section>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="h4 fw-bold mb-0 text-dark">Carta y Menú</h2>
          <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="card border-0 bg-light rounded-4 text-center p-5">
            <i className="bi bi-basket text-muted display-4 mb-3 d-block" />
            <h3 className="h5 fw-bold text-dark">Este comercio aún no tiene productos publicados</h3>
            <p className="text-secondary small mb-0">
              Pronto estarán disponibles deliciosas opciones para ordenar.
            </p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {products.map((product) => (
              <div className="col" key={product.id}>
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
