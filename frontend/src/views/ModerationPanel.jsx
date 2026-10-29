import { useState, useEffect, useMemo, useRef } from 'react'

import { Link } from 'react-router-dom'
import { storeService } from '../services/storeService'
import { productService } from '../services/productService'
import { useAuth } from '../hooks/useAuth'
import { getImageUrl } from '../utils/imageUrl'

export default function ModerationPanel() {
  const { getToken } = useAuth()
  const [activeTab, setActiveTab] = useState('stores') // 'stores' | 'products' | 'audit'

  const [stores, setStores] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [auditLog, setAuditLog] = useState([])
  const auditCounterRef = useRef(1)

  const addAuditEntry = (action, targetType, targetName, detail) => {
    const entryId = auditCounterRef.current++
    const timeStr = new Date().toLocaleTimeString()
    setAuditLog((prev) => [
      {
        id: entryId,
        action,
        targetType,
        targetName,
        detail,
        timestamp: timeStr,
      },
      ...prev,
    ])
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [storesRes, prodsRes] = await Promise.all([
        storeService.getStores(),
        productService.getProducts(),
      ])

      if (storesRes.success) {
        setStores(storesRes.data || [])
      } else {
        setError(storesRes.error || 'Error al cargar las tiendas para moderación.')
      }

      if (prodsRes.success) {
        setProducts(prodsRes.data || [])
      } else {
        setError((prev) => (prev ? `${prev} | ` : '') + (prodsRes.error || 'Error al cargar productos.'))
      }
    } catch {
      setError('Error de conexión con el servidor al cargar los datos de moderación.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const [storesRes, prodsRes] = await Promise.all([
          storeService.getStores(),
          productService.getProducts(),
        ])
        if (!isMounted) return

        if (storesRes.success) {
          setStores(storesRes.data || [])
        } else {
          setError(storesRes.error || 'Error al cargar las tiendas para moderación.')
        }

        if (prodsRes.success) {
          setProducts(prodsRes.data || [])
        } else {
          setError((prev) => (prev ? `${prev} | ` : '') + (prodsRes.error || 'Error al cargar productos.'))
        }
      } catch {
        if (isMounted) {
          setError('Error de conexión con el servidor al cargar los datos de moderación.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [])


  const handleToggleStoreActive = async (store) => {
    const token = getToken()
    const nextStatus = !store.is_active
    const res = await storeService.toggleActive(store.id, token)
    if (res.success) {
      setStores((prev) =>
        prev.map((s) => (s.id === store.id ? { ...s, is_active: nextStatus } : s))
      )
      const actionText = nextStatus ? 'Reactivada' : 'Suspendida'
      setFeedback({ type: 'success', message: `Tienda "${store.name}" fue ${actionText.toLowerCase()} preventivamente.` })
      addAuditEntry(
        nextStatus ? 'REACTIVAR_TIENDA' : 'SUSPENDER_TIENDA',
        'Tienda',
        store.name,
        `Estado modificado a: ${nextStatus ? 'Activa' : 'Suspendida'}`
      )
    } else {
      setFeedback({ type: 'danger', message: res.error || 'No se pudo cambiar el estado de la tienda.' })
    }
  }

  const handleDeleteStore = async (store) => {
    if (!window.confirm(`¿Estás seguro de eliminar definitivamente la tienda "${store.name}"? Esta acción no se puede deshacer.`)) {
      return
    }
    const token = getToken()
    const res = await storeService.deleteStore(store.id, token)
    if (res.success) {
      setStores((prev) => prev.filter((s) => s.id !== store.id))
      setFeedback({ type: 'success', message: `Tienda "${store.name}" fue eliminada definitivamente.` })
      addAuditEntry('ELIMINAR_TIENDA', 'Tienda', store.name, `Tienda ID #${store.id} eliminada`)
    } else {
      setFeedback({ type: 'danger', message: res.error || 'No se pudo eliminar la tienda.' })
    }
  }

  const handleToggleProductAvailability = async (product) => {
    const token = getToken()
    const nextAvailable = !product.is_available
    const res = await productService.updateProduct(
      product.id,
      { is_available: nextAvailable },
      token
    )
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_available: nextAvailable } : p))
      )
      const actionText = nextAvailable ? 'Activado' : 'Pausado'
      setFeedback({ type: 'success', message: `Plato "${product.name}" fue ${actionText.toLowerCase()} preventivamente.` })
      addAuditEntry(
        nextAvailable ? 'ACTIVAR_PRODUCTO' : 'PAUSAR_PRODUCTO',
        'Producto',
        product.name,
        `Disponibilidad: ${nextAvailable ? 'Disponible' : 'Pausado'}`
      )
    } else {
      setFeedback({ type: 'danger', message: res.error || 'No se pudo modificar la disponibilidad del producto.' })
    }
  }

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
      return
    }
    const token = getToken()
    const res = await productService.deleteProduct(product.id, token)
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
      setFeedback({ type: 'success', message: `Producto "${product.name}" eliminado correctamente.` })
      addAuditEntry('ELIMINAR_PRODUCTO', 'Producto', product.name, `Producto ID #${product.id} eliminado`)
    } else {
      setFeedback({ type: 'danger', message: res.error || 'No se pudo eliminar el producto.' })
    }
  }

  // Filtrado de tiendas y productos por búsqueda
  const filteredStores = useMemo(() => {
    if (!searchFilter.trim()) return stores
    const q = searchFilter.toLowerCase().trim()
    return stores.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        String(s.id).includes(q)
    )
  }, [stores, searchFilter])

  const filteredProducts = useMemo(() => {
    if (!searchFilter.trim()) return products
    const q = searchFilter.toLowerCase().trim()
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        String(p.id).includes(q)
    )
  }, [products, searchFilter])

  const storeCountActive = stores.filter((s) => s.is_active !== false).length
  const storeCountSuspended = stores.filter((s) => s.is_active === false).length
  const productCountAvailable = products.filter((p) => p.is_available).length
  const productCountPaused = products.filter((p) => !p.is_available).length

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small mb-1">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none text-secondary">
                  Inicio
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Moderación
              </li>
            </ol>
          </nav>
          <div className="d-flex align-items-center gap-2">
            <h1 className="h3 fw-bold text-dark mb-0">Panel de Moderación Admin</h1>
            <span className="badge bg-danger rounded-pill">
              <i className="bi bi-shield-lock-fill me-1" />
              Role: Admin
            </span>
          </div>
          <p className="text-secondary small mb-0 mt-1">
            Supervisión, auditoría y baja preventiva de comercios y productos infractores.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
            onClick={loadData}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`} />
            Actualizar datos
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Tiendas Activas</span>
              <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1">
                <i className="bi bi-shop" />
              </span>
            </div>
            <h3 className="fw-bold mb-0 text-dark">{storeCountActive}</h3>
            <small className="text-muted">{storeCountSuspended} suspendidas preventivamente</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Tiendas Suspendidas</span>
              <span className="badge bg-danger-subtle text-danger rounded-pill px-2 py-1">
                <i className="bi bi-slash-circle" />
              </span>
            </div>
            <h3 className="fw-bold mb-0 text-danger">{storeCountSuspended}</h3>
            <small className="text-muted">Fuera del catálogo público</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Productos Activos</span>
              <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1">
                <i className="bi bi-box-seam" />
              </span>
            </div>
            <h3 className="fw-bold mb-0 text-dark">{productCountAvailable}</h3>
            <small className="text-muted">{productCountPaused} pausados</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Acciones de Sesión</span>
              <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-1">
                <i className="bi bi-clock-history" />
              </span>
            </div>
            <h3 className="fw-bold mb-0 text-dark">{auditLog.length}</h3>
            <small className="text-muted">En el registro de auditoría</small>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show rounded-4 shadow-sm mb-4`} role="alert">
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5`} />
            <div>{feedback.message}</div>
          </div>
          <button type="button" className="btn-close" onClick={() => setFeedback(null)} aria-label="Cerrar"></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger rounded-4 shadow-sm mb-4" role="alert">
          <i className="bi bi-x-circle-fill me-2" />
          {error}
        </div>
      )}

      {/* Tabs & Search Header */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        <div className="card-header bg-white border-bottom p-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <ul className="nav nav-pills gap-2" role="tablist">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link rounded-pill px-3 py-2 ${activeTab === 'stores' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stores')}
                >
                  <i className="bi bi-shop me-1" />
                  Tiendas ({filteredStores.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link rounded-pill px-3 py-2 ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => setActiveTab('products')}
                >
                  <i className="bi bi-egg-fried me-1" />
                  Productos ({filteredProducts.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link rounded-pill px-3 py-2 ${activeTab === 'audit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('audit')}
                >
                  <i className="bi bi-list-check me-1" />
                  Auditoría ({auditLog.length})
                </button>
              </li>
            </ul>

            {activeTab !== 'audit' && (
              <div className="position-relative" style={{ minWidth: '240px', maxWidth: '340px' }}>
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input
                  type="text"
                  className="form-control form-control-sm rounded-pill ps-5 pe-3 py-2 border"
                  placeholder={`Buscar en ${activeTab === 'stores' ? 'tiendas' : 'productos'}...`}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  aria-label="Filtrar moderación"
                />
                {searchFilter && (
                  <button
                    type="button"
                    className="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-secondary text-decoration-none"
                    onClick={() => setSearchFilter('')}
                  >
                    <i className="bi bi-x-circle-fill" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-2" role="status">
                <span className="visually-hidden">Cargando datos...</span>
              </div>
              <p className="text-secondary small mb-0">Cargando registros del sistema...</p>
            </div>
          ) : (
            <>
              {/* Tab 1: Tiendas */}
              {activeTab === 'stores' && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-secondary small text-uppercase">
                      <tr>
                        <th style={{ width: '60px' }}>ID</th>
                        <th style={{ width: '80px' }}>Logo</th>
                        <th>Comercio</th>
                        <th>Descripción</th>
                        <th style={{ width: '130px' }}>Estado</th>
                        <th style={{ width: '220px' }} className="text-end pe-3">Acciones de Moderación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStores.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-secondary">
                            No se encontraron tiendas registradas.
                          </td>
                        </tr>
                      ) : (
                        filteredStores.map((store) => {
                          const isActive = store.is_active !== false
                          return (
                            <tr key={store.id}>
                              <td className="fw-semibold text-muted">#{store.id}</td>
                              <td>
                                {store.image ? (
                                  <img
                                    src={getImageUrl(store.image)}
                                    alt={store.name}
                                    className="rounded-3 object-fit-cover"
                                    style={{ width: '48px', height: '48px' }}
                                  />
                                ) : (
                                  <div
                                    className="rounded-3 bg-light d-flex align-items-center justify-content-center text-muted fw-bold"
                                    style={{ width: '48px', height: '48px', fontSize: '0.9rem' }}
                                  >
                                    {store.name?.slice(0, 2).toUpperCase() || 'FR'}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="fw-bold text-dark">{store.name}</div>
                                <small className="text-secondary d-block">
                                  Propietario ID #{store.owner}
                                </small>
                              </td>
                              <td>
                                <div
                                  className="text-secondary small text-truncate"
                                  style={{ maxWidth: '280px' }}
                                  title={store.description}
                                >
                                  {store.description || 'Sin descripción'}
                                </div>
                              </td>
                              <td>
                                {isActive ? (
                                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1">
                                    <i className="bi bi-check-circle-fill me-1" />
                                    Activa
                                  </span>
                                ) : (
                                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1">
                                    <i className="bi bi-slash-circle-fill me-1" />
                                    Suspendida
                                  </span>
                                )}
                              </td>
                              <td className="text-end pe-3">
                                <div className="d-inline-flex gap-2">
                                  <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 ${
                                      isActive ? 'btn-outline-warning text-dark' : 'btn-outline-success'
                                    }`}
                                    onClick={() => handleToggleStoreActive(store)}
                                    title={isActive ? 'Suspender preventivamente esta tienda' : 'Reactivar tienda'}
                                  >
                                    <i className={`bi ${isActive ? 'bi-pause-circle' : 'bi-play-circle'} me-1`} />
                                    {isActive ? 'Suspender' : 'Reactivar'}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                    onClick={() => handleDeleteStore(store)}
                                    title="Eliminar tienda de la plataforma"
                                  >
                                    <i className="bi bi-trash3 me-1" />
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Productos */}
              {activeTab === 'products' && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-secondary small text-uppercase">
                      <tr>
                        <th style={{ width: '60px' }}>ID</th>
                        <th style={{ width: '80px' }}>Foto</th>
                        <th>Producto</th>
                        <th>Tienda</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th style={{ width: '130px' }}>Estado</th>
                        <th style={{ width: '220px' }} className="text-end pe-3">Acciones de Moderación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4 text-secondary">
                            No se encontraron productos registrados.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => {
                          const isAvailable = product.is_available
                          return (
                            <tr key={product.id}>
                              <td className="fw-semibold text-muted">#{product.id}</td>
                              <td>
                                {product.image ? (
                                  <img
                                    src={getImageUrl(product.image)}
                                    alt={product.name}
                                    className="rounded-3 object-fit-cover"
                                    style={{ width: '48px', height: '48px' }}
                                  />
                                ) : (
                                  <div
                                    className="rounded-3 bg-light d-flex align-items-center justify-content-center text-muted fw-bold"
                                    style={{ width: '48px', height: '48px' }}
                                  >
                                    🍽️
                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="fw-bold text-dark">{product.name}</div>
                                <div
                                  className="text-secondary small text-truncate"
                                  style={{ maxWidth: '240px' }}
                                  title={product.description}
                                >
                                  {product.description || 'Sin descripción'}
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-light text-dark border">
                                  Tienda #{product.store}
                                </span>
                              </td>
                              <td className="fw-bold text-dark">${product.price}</td>
                              <td>
                                {product.track_stock ? (
                                  <span className={`small ${product.stock > 0 ? 'text-dark' : 'text-danger fw-bold'}`}>
                                    {product.stock} un.
                                  </span>
                                ) : (
                                  <span className="small text-muted">Gastronómico</span>
                                )}
                              </td>
                              <td>
                                {isAvailable ? (
                                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1">
                                    <i className="bi bi-check-circle-fill me-1" />
                                    Disponible
                                  </span>
                                ) : (
                                  <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2 py-1">
                                    <i className="bi bi-pause-circle-fill me-1" />
                                    Pausado
                                  </span>
                                )}
                              </td>
                              <td className="text-end pe-3">
                                <div className="d-inline-flex gap-2">
                                  <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 ${
                                      isAvailable ? 'btn-outline-warning text-dark' : 'btn-outline-success'
                                    }`}
                                    onClick={() => handleToggleProductAvailability(product)}
                                    title={isAvailable ? 'Pausar disponibilidad de este plato' : 'Reactivar plato'}
                                  >
                                    <i className={`bi ${isAvailable ? 'bi-pause-circle' : 'bi-play-circle'} me-1`} />
                                    {isAvailable ? 'Pausar' : 'Activar'}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                    onClick={() => handleDeleteProduct(product)}
                                    title="Eliminar producto"
                                  >
                                    <i className="bi bi-trash3 me-1" />
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Auditoría */}
              {activeTab === 'audit' && (
                <div className="p-3">
                  {auditLog.length === 0 ? (
                    <div className="text-center py-5 text-secondary">
                      <i className="bi bi-shield-check fs-1 text-muted d-block mb-2" />
                      <p className="mb-0">No se realizaron acciones de moderación en la sesión actual.</p>
                      <small className="text-muted">Las suspensiones o pausas preventivas quedarán registradas aquí.</small>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {auditLog.map((log) => (
                        <div key={log.id} className="list-group-item d-flex align-items-center justify-content-between py-3">
                          <div className="d-flex align-items-center gap-3">
                            <span className="badge bg-primary-subtle text-primary rounded-pill p-2">
                              <i className="bi bi-clock-history fs-6" />
                            </span>
                            <div>
                              <div className="fw-bold text-dark">
                                {log.action} — <span className="text-primary">{log.targetName}</span> ({log.targetType})
                              </div>
                              <small className="text-secondary">{log.detail}</small>
                            </div>
                          </div>
                          <span className="badge bg-light text-secondary border">{log.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
