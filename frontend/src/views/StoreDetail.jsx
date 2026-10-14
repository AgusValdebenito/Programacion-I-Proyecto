import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { storeService } from '../services/storeService'
import { productService } from '../services/productService'
import { useCart } from '../hooks/useCart'
import ProductCard from '../components/ProductCard'
import { getImageUrl } from '../utils/imageUrl'

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
  const { addToCart, clearCart } = useCart()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addedItemMessage, setAddedItemMessage] = useState(null)
  const [actionErrorMessage, setActionErrorMessage] = useState(null)
  const [conflictProduct, setConflictProduct] = useState(null)

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
          const storeProducts = (productsRes.data || []).filter(
            (p) => String(p.store) === String(id)
          )
          setProducts(storeProducts)
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

  const handleAddToCart = async (product) => {
    const res = await addToCart(product)
    if (res.monoStoreConflict) {
      setConflictProduct(product)
      return
    }

    if (res.success) {
      setAddedItemMessage(`Se agregó "${product.name}" al carrito`)
      setTimeout(() => {
        setAddedItemMessage(null)
      }, 3000)
    } else if (res.error) {
      setActionErrorMessage(res.error)
      setTimeout(() => setActionErrorMessage(null), 4000)
    }
  }

  const handleResolveConflictAndAdd = async () => {
    if (!conflictProduct) return
    const prodToAdd = conflictProduct
    setConflictProduct(null)
    await clearCart()
    const res = await addToCart(prodToAdd)
    if (res.success) {
      setAddedItemMessage(`Se vació el carrito anterior y se agregó "${prodToAdd.name}"`)
      setTimeout(() => setAddedItemMessage(null), 3000)
    } else if (res.error) {
      setActionErrorMessage(res.error)
      setTimeout(() => setActionErrorMessage(null), 4000)
    }
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
      {/* Toast de notificación temporal de éxito */}
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

      {/* Toast de notificación temporal de error */}
      {actionErrorMessage && (
        <div
          className="alert alert-danger position-fixed top-0 end-0 m-3 shadow-lg z-3 d-flex align-items-center"
          style={{ maxWidth: '360px' }}
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5 flex-shrink-0" />
          <div>{actionErrorMessage}</div>
        </div>
      )}

      {/* Modal de Advertencia Regla Mono-tienda */}
      {conflictProduct && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 p-2">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="bi bi-exclamation-triangle-fill text-warning me-2" />
                  Cambiar de comercio
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConflictProduct(null)}
                  aria-label="Cerrar modal"
                />
              </div>
              <div className="modal-body py-3">
                <p className="text-secondary mb-0">
                  Tu carrito ya contiene productos de otra tienda. En FoodRush cada pedido es exclusivo de un único comercio.
                  ¿Deseás vaciar el carrito actual para pedir en <strong>{store.name}</strong>?
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-3"
                  onClick={() => setConflictProduct(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={handleResolveConflictAndAdd}
                >
                  Vaciar y agregar este plato
                </button>
              </div>
            </div>
          </div>
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
            className="fr-store-logo fr-grad-1 flex-shrink-0 d-flex align-items-center justify-content-center overflow-hidden shadow-sm"
            style={{ width: '84px', height: '84px', fontSize: '1.75rem', borderRadius: '1.25rem' }}
          >
            {store.image ? (
              <img
                src={getImageUrl(store.image)}
                alt={store.name}
                className="w-100 h-100 object-fit-cover"
              />
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
