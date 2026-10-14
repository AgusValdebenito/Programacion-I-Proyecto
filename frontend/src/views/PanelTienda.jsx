import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { storeService } from '../services/storeService'
import { productService } from '../services/productService'
import { orderService } from '../services/orderService'
import { getImageUrl } from '../utils/imageUrl'
import EditarTiendaModal from '../components/tienda/EditarTiendaModal'
import ProductoModal from '../components/tienda/ProductoModal'

/**
 * Panel de Administración y Despacho del Vendedor (TP9 - Milestone 3, Issues #19, #20, #21).
 */
export default function PanelTienda() {
  const { getToken, updateUser } = useAuth()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [storeError, setStoreError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [activeTab, setActiveTab] = useState('resumen') // 'resumen' | 'menu' | 'pedidos'

  // Onboarding para crear tienda
  const [newStoreName, setNewStoreName] = useState('')
  const [newStoreDesc, setNewStoreDesc] = useState('')
  const [newStoreImage, setNewStoreImage] = useState('')
  const [creatingStore, setCreatingStore] = useState(false)
  const [createStoreError, setCreateStoreError] = useState(null)

  // Catálogo de productos
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productsError, setProductsError] = useState(null)
  const [productSearch, setProductSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState(null)

  // Monitor de pedidos
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState(null)
  const [orderFilter, setOrderFilter] = useState('todos') // 'todos' | 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled'
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  // Cancelación / Rechazo reactivo (Milestone 4, Issues #22 y #23)
  const [rejectingOrder, setRejectingOrder] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('Falta de insumos / Producto agotado')
  const [rejectionProductId, setRejectionProductId] = useState('')

  // Modales
  const [showStoreModal, setShowStoreModal] = useState(false)

  // Carga de productos de la tienda
  const fetchProducts = useCallback(async () => {
    if (!store?.id) return
    setLoadingProducts(true)
    setProductsError(null)
    const result = await productService.getProducts({ store: store.id })
    if (result.success && Array.isArray(result.data)) {
      setProducts(result.data)
    } else {
      setProductsError(result.error || 'Error al cargar los productos del local.')
    }
    setLoadingProducts(false)
  }, [store])

  // Carga de pedidos de la tienda
  const fetchOrders = useCallback(async () => {
    if (!store?.id) return
    setLoadingOrders(true)
    setOrdersError(null)
    const token = getToken()
    const result = await orderService.getStoreOrders(store.id, token)
    if (result.success && Array.isArray(result.data)) {
      setOrders(result.data)
    } else {
      setOrdersError(result.error || 'Error al cargar los pedidos de la tienda.')
    }
    setLoadingOrders(false)
  }, [store, getToken])

  // Carga inicial sincronizada
  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      setLoading(true)
      setStoreError(null)
      const token = getToken()
      const result = await storeService.getMyStore(token)
      if (!isMounted) return

      if (result.success && result.data) {
        setStore(result.data)
        setProductsError(null)
        setOrdersError(null)
        const [prodRes, ordRes] = await Promise.all([
          productService.getProducts({ store: result.data.id }),
          orderService.getStoreOrders(result.data.id, token),
        ])
        if (!isMounted) return
        if (prodRes.success && Array.isArray(prodRes.data)) {
          setProducts(prodRes.data)
        } else {
          setProductsError(prodRes.error || 'Error al cargar los productos del local.')
        }
        if (ordRes.success && Array.isArray(ordRes.data)) {
          setOrders(ordRes.data)
        } else {
          setOrdersError(ordRes.error || 'Error al cargar los pedidos de la tienda.')
        }
      } else if (
        !result.success &&
        result.error &&
        result.error.toLowerCase().includes('conexión')
      ) {
        setStoreError(result.error)
      } else {
        setStore(null)
      }
      setLoading(false)
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [getToken])

  // Crear tienda (Onboarding)
  const handleCreateStore = async (e) => {
    e.preventDefault()
    if (!newStoreName.trim()) {
      setCreateStoreError('El nombre de la tienda es obligatorio.')
      return
    }

    setCreatingStore(true)
    setCreateStoreError(null)
    const token = getToken()
    const payload = {
      name: newStoreName.trim(),
      description: newStoreDesc.trim(),
      image: newStoreImage.trim() || undefined,
    }

    const result = await storeService.createStore(payload, token)
    setCreatingStore(false)

    if (result.success) {
      setStore(result.data)
      if (updateUser) {
        updateUser({ role: 'vendedor' })
      }
    } else {
      setCreateStoreError(result.error || 'Error al crear la tienda')
    }
  }

  // Guardar edición de tienda
  const handleUpdateStore = async (storeData) => {
    const token = getToken()
    const result = await storeService.updateStore(store.id, storeData, token)
    if (result.success) {
      setStore(result.data)
      return { success: true }
    }
    return result
  }

  // Toggle de disponibilidad de producto
  const handleToggleAvailability = async (product) => {
    const token = getToken()
    const nextAvailability = !product.is_available
    const result = await productService.updateProduct(
      product.id,
      { is_available: nextAvailability },
      token
    )
    if (result.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_available: nextAvailability } : p))
      )
    }
  }

  // Guardar producto (crear o editar)
  const handleSaveProduct = async (payload, productId) => {
    const token = getToken()
    if (productId) {
      // Editar
      const result = await productService.updateProduct(productId, payload, token)
      if (result.success) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? result.data : p)))
        return { success: true }
      }
      return result
    } else {
      // Crear
      const createPayload = { ...payload, store: store.id }
      const result = await productService.createProduct(createPayload, token)
      if (result.success) {
        setProducts((prev) => [result.data, ...prev])
        return { success: true }
      }
      return result
    }
  }

  // Eliminar producto
  const handleDeleteProduct = async (productId) => {
    const token = getToken()
    setActionError(null)
    setDeletingProductId(productId)
    const result = await productService.deleteProduct(productId, token)
    setDeletingProductId(null)
    if (result.success) {
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } else {
      setActionError(
        result.error ||
          'No se pudo eliminar el producto. Si ya tuvo pedidos asociados, podés desactivarlo con el botón de disponibilidad.'
      )
    }
  }

  // Transición de estado de pedido (Cocina)
  const handleTransitionOrder = async (orderId, newStatus, extraData = {}) => {
    const token = getToken()
    setActionError(null)
    setUpdatingOrderId(orderId)
    const result = Object.keys(extraData).length > 0
      ? await orderService.updateOrderStatus(orderId, newStatus, token, extraData)
      : await orderService.updateOrderStatus(orderId, newStatus, token)
    setUpdatingOrderId(null)
    if (result.success) {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, ...result.data, status: newStatus } : ord))
      )
      // Si se canceló y pausó un producto reactivamente, sincronizar en el menú del vendedor
      if (extraData?.cancelled_product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === Number(extraData.cancelled_product) ? { ...p, is_available: false } : p))
        )
      }
    } else {
      setActionError(result.error || 'No se pudo actualizar el estado del pedido.')
    }
  }

  // Apertura del modal de rechazo con opciones y detección de plato causante
  const handleOpenRejectModal = (ord) => {
    setRejectingOrder(ord)
    setRejectionReason('Falta de insumos / Producto agotado')
    const firstItemProdId = ord.items?.[0]?.product || ''
    setRejectionProductId(firstItemProdId ? String(firstItemProdId) : '')
  }

  // Confirmar rechazo de orden
  const handleConfirmRejectOrder = async () => {
    if (!rejectingOrder) return
    const extraData = {
      cancellation_reason: rejectionReason,
    }
    if (rejectionReason.includes('insumos') || rejectionReason.includes('agotado')) {
      if (rejectionProductId) {
        extraData.cancelled_product = Number(rejectionProductId)
      }
    }
    await handleTransitionOrder(rejectingOrder.id, 'cancelled', extraData)
    setRejectingOrder(null)
  }

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products
    const q = productSearch.toLowerCase()
    return products.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    )
  }, [products, productSearch])

  // Filtrado de pedidos
  const filteredOrders = useMemo(() => {
    if (orderFilter === 'todos') return orders
    return orders.filter((o) => o.status === orderFilter)
  }, [orders, orderFilter])

  // KPIs
  const stats = useMemo(() => {
    const totalProd = products.length
    const availableProd = products.filter((p) => p.is_available).length
    const pendingOrders = orders.filter((o) => o.status === 'pending').length
    const deliveredOrders = orders.filter((o) => o.status === 'delivered')
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0)

    return {
      totalProd,
      availableProd,
      pendingOrders,
      totalOrders: orders.length,
      totalRevenue,
    }
  }, [products, orders])

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando panel de tienda...</span>
        </div>
        <p className="text-secondary mt-3">Cargando datos del comercio...</p>
      </div>
    )
  }

  // Error al cargar tienda
  if (storeError) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="alert alert-danger p-4 rounded-4 max-w-600 mx-auto" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-1 text-danger d-block mb-3" />
          <h2 className="h5 fw-bold mb-2">Error al cargar el panel de tienda</h2>
          <p className="text-secondary small mb-4">{storeError}</p>
          <button
            type="button"
            className="btn btn-outline-danger rounded-pill px-4"
            onClick={() => {
              setLoading(true)
              setStoreError(null)
              storeService.getMyStore(getToken()).then((res) => {
                if (res.success) {
                  setStore(res.data)
                } else {
                  setStoreError(res.error || 'Error al conectar con el servidor')
                }
                setLoading(false)
              })
            }}
          >
            <i className="bi bi-arrow-clockwise me-1" />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Onboarding si el usuario no tiene tienda
  if (!store) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
              <div
                className="bg-primary-subtle text-primary rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '70px', height: '70px', fontSize: '2rem' }}
              >
                <i className="bi bi-shop"></i>
              </div>
              <h2 className="fw-bold mb-2">¡Abrí tu Tienda en FoodRush!</h2>
              <p className="text-secondary mb-4">
                Publicá tus platos, recibí pedidos en vivo y hacé crecer tu negocio gastronómico.
              </p>

              {createStoreError && (
                <div className="alert alert-danger py-2 small text-start" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                  {createStoreError}
                </div>
              )}

              <form onSubmit={handleCreateStore} className="text-start">
                <div className="mb-3">
                  <label htmlFor="newStoreName" className="form-label small fw-semibold">
                    Nombre del Comercio *
                  </label>
                  <input
                    id="newStoreName"
                    type="text"
                    className="form-control"
                    placeholder="Ej. Tacos El Pastor"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="newStoreDesc" className="form-label small fw-semibold">
                    Descripción / Especialidad
                  </label>
                  <textarea
                    id="newStoreDesc"
                    className="form-control"
                    rows="3"
                    placeholder="Contanos sobre tu menú y comidas..."
                    value={newStoreDesc}
                    onChange={(e) => setNewStoreDesc(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="newStoreImg" className="form-label small fw-semibold">
                    URL del Logotipo o Foto de Portada
                  </label>
                  <input
                    id="newStoreImg"
                    type="text"
                    className="form-control"
                    placeholder="https://... o ruta de imagen"
                    value={newStoreImage}
                    onChange={(e) => setNewStoreImage(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold rounded-pill"
                  disabled={creatingStore}
                >
                  {creatingStore ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creando comercio...
                    </>
                  ) : (
                    'Abrir mi Tienda Ahora'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard de Vendedor con Tienda Activa
  return (
    <div className="container py-4">
      {/* Banner Superior de Tienda */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <img
              src={getImageUrl(store.image) || '/images/placeholder-store.svg'}
              alt={store.name}
              className="rounded-4 object-fit-cover shadow-sm"
              style={{ width: '75px', height: '75px', backgroundColor: '#f8f9fa' }}
              onError={(e) => {
                e.target.src = '/images/placeholder-store.svg'
              }}
            />
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h3 className="fw-bold mb-0">{store.name}</h3>
                <span className="badge bg-success-subtle text-success border border-success-subtle">
                  <i className="bi bi-patch-check-fill me-1"></i>
                  Tienda Activa
                </span>
              </div>
              <p className="text-secondary small mb-0">{store.description || 'Sin descripción'}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline-primary rounded-pill btn-sm px-3"
            onClick={() => setShowStoreModal(true)}
          >
            <i className="bi bi-pencil me-1"></i>
            Editar Tienda
          </button>
        </div>
      </div>

      {actionError && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-4 d-flex align-items-center justify-content-between" role="alert">
          <div>
            <i className="bi bi-exclamation-triangle-fill me-2" />
            {actionError}
          </div>
          <button
            type="button"
            className="btn-close position-static p-2"
            onClick={() => setActionError(null)}
            aria-label="Cerrar alerta"
          />
        </div>
      )}

      {/* Navegación por pestañas */}
      <ul className="nav nav-pills gap-2 mb-4 p-1 bg-white rounded-pill shadow-sm border d-inline-flex" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            type="button"
            className={`nav-link rounded-pill px-4 fw-semibold ${activeTab === 'resumen' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumen')}
          >
            <i className="bi bi-speedometer2 me-2"></i>
            Resumen
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            type="button"
            className={`nav-link rounded-pill px-4 fw-semibold ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            <i className="bi bi-card-list me-2"></i>
            Menú y Productos
            {products.length > 0 && (
              <span className="badge bg-secondary ms-2">{products.length}</span>
            )}
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            type="button"
            className={`nav-link rounded-pill px-4 fw-semibold ${activeTab === 'pedidos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pedidos')}
          >
            <i className="bi bi-bell-fill me-2"></i>
            Monitor de Pedidos
            {stats.pendingOrders > 0 && (
              <span className="badge bg-danger ms-2">{stats.pendingOrders}</span>
            )}
          </button>
        </li>
      </ul>

      {/* TAB 1: RESUMEN / KPIS */}
      {activeTab === 'resumen' && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-semibold">Platos Publicados</span>
                <div className="bg-primary-subtle text-primary p-2 rounded-3">
                  <i className="bi bi-basket2-fill"></i>
                </div>
              </div>
              <h2 className="fw-bold mb-1">{stats.totalProd}</h2>
              <span className="small text-success">
                <i className="bi bi-check-circle-fill me-1"></i>
                {stats.availableProd} disponibles
              </span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-semibold">Pedidos Pendientes</span>
                <div className="bg-warning-subtle text-warning p-2 rounded-3">
                  <i className="bi bi-hourglass-split"></i>
                </div>
              </div>
              <h2 className="fw-bold mb-1">{stats.pendingOrders}</h2>
              <span className="small text-muted">Aguardando preparación</span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-semibold">Total de Pedidos</span>
                <div className="bg-info-subtle text-info p-2 rounded-3">
                  <i className="bi bi-receipt"></i>
                </div>
              </div>
              <h2 className="fw-bold mb-1">{stats.totalOrders}</h2>
              <span className="small text-muted">Historial completo</span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-semibold">Ventas Entregadas</span>
                <div className="bg-success-subtle text-success p-2 rounded-3">
                  <i className="bi bi-currency-dollar"></i>
                </div>
              </div>
              <h2 className="fw-bold mb-1">${stats.totalRevenue.toFixed(2)}</h2>
              <span className="small text-success">Órdenes completadas</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GESTIÓN DE MENÚ / CATÁLOGO (ISSUE #20) */}
      {activeTab === 'menu' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
            <div>
              <h4 className="fw-bold mb-1">Carta y Productos del Local</h4>
              <p className="text-secondary small mb-0">
                Activá o pausá platos en tiempo real y gestioná precios y disponibilidad.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-3 btn-sm"
                onClick={fetchProducts}
                disabled={loadingProducts}
                title="Actualizar catálogo de productos"
              >
                <i className={`bi bi-arrow-clockwise me-1 ${loadingProducts ? 'spin' : ''}`}></i>
                Actualizar
              </button>
              <button
                type="button"
                className="btn btn-primary rounded-pill px-3 fw-semibold"
                onClick={() => {
                  setEditingProduct(null)
                  setShowProductModal(true)
                }}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Nuevo Producto
              </button>
            </div>
          </div>

          {/* Error al cargar productos */}
          {productsError && (
            <div
              className="alert alert-danger d-flex align-items-center justify-content-between rounded-4 mb-4"
              role="alert"
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div>
                  <strong>Error al cargar el catálogo:</strong> {productsError}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger rounded-pill px-3"
                onClick={fetchProducts}
                disabled={loadingProducts}
              >
                <i className={`bi bi-arrow-clockwise me-1 ${loadingProducts ? 'spin' : ''}`}></i>
                Reintentar
              </button>
            </div>
          )}

          {/* Buscador de productos */}
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-secondary"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Buscar por nombre o descripción..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
          </div>

          {loadingProducts ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando productos...</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4">
              <i className="bi bi-basket text-secondary" style={{ fontSize: '2.5rem' }}></i>
              <h5 className="fw-bold mt-2">No se encontraron productos</h5>
              <p className="text-secondary small mb-3">
                {productSearch ? 'Probá con otro término de búsqueda.' : 'Todavía no agregaste ningún plato a tu menú.'}
              </p>
              {!productSearch && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary rounded-pill px-3"
                  onClick={() => {
                    setEditingProduct(null)
                    setShowProductModal(true)
                  }}
                >
                  Agregar primer producto
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ width: '60px' }}>Foto</th>
                    <th scope="col">Nombre & Descripción</th>
                    <th scope="col">Precio</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Disponibilidad</th>
                    <th scope="col" className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <img
                          src={getImageUrl(prod.image) || '/images/placeholder-product.svg'}
                          alt={prod.name}
                          className="rounded-3 object-fit-cover shadow-sm"
                          style={{ width: '48px', height: '48px' }}
                          onError={(e) => {
                            e.target.src = '/images/placeholder-product.svg'
                          }}
                        />
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{prod.name}</div>
                        <div className="small text-secondary text-truncate" style={{ maxWidth: '250px' }}>
                          {prod.description || 'Sin descripción'}
                        </div>
                      </td>
                      <td className="fw-bold text-primary">${parseFloat(prod.price || 0).toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge ${
                            prod.stock > 5 ? 'bg-success-subtle text-success' : prod.stock > 0 ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'
                          }`}
                        >
                          {prod.stock} u.
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch m-0">
                          <input
                            className="form-check-input cursor-pointer"
                            type="checkbox"
                            role="switch"
                            id={`switch-${prod.id}`}
                            checked={prod.is_available}
                            onChange={() => handleToggleAvailability(prod)}
                          />
                          <label
                            className="form-check-label small cursor-pointer"
                            htmlFor={`switch-${prod.id}`}
                          >
                            {prod.is_available ? (
                              <span className="text-success fw-semibold">Disponible</span>
                            ) : (
                              <span className="text-secondary">Pausado</span>
                            )}
                          </label>
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            title="Editar plato"
                            onClick={() => {
                              setEditingProduct(prod)
                              setShowProductModal(true)
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Eliminar plato"
                            disabled={deletingProductId === prod.id}
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar '${prod.name}'?`)) {
                                handleDeleteProduct(prod.id)
                              }
                            }}
                          >
                            {deletingProductId === prod.id ? (
                              <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                              <i className="bi bi-trash"></i>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MONITOR DE PEDIDOS Y COCINA (ISSUE #21) */}
      {activeTab === 'pedidos' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
            <div>
              <h4 className="fw-bold mb-1">Monitor de Pedidos y Cocina</h4>
              <p className="text-secondary small mb-0">
                Avanzá el estado de preparación y despacho de los pedidos de tu tienda.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline-primary rounded-pill btn-sm px-3"
              onClick={fetchOrders}
              disabled={loadingOrders}
            >
              <i className={`bi bi-arrow-clockwise me-1 ${loadingOrders ? 'spin' : ''}`}></i>
              Actualizar Pedidos
            </button>
          </div>

          {/* Error al cargar pedidos */}
          {ordersError && (
            <div
              className="alert alert-danger d-flex align-items-center justify-content-between rounded-4 mb-4"
              role="alert"
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div>
                  <strong>Error al cargar pedidos:</strong> {ordersError}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger rounded-pill px-3"
                onClick={fetchOrders}
                disabled={loadingOrders}
              >
                <i className={`bi bi-arrow-clockwise me-1 ${loadingOrders ? 'spin' : ''}`}></i>
                Reintentar
              </button>
            </div>
          )}

          {/* Filtros por estado */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'pending', label: 'Pendientes', badge: 'bg-warning' },
              { id: 'preparing', label: 'En Preparación', badge: 'bg-primary' },
              { id: 'delivering', label: 'En Reparto', badge: 'bg-info' },
              { id: 'delivered', label: 'Entregados', badge: 'bg-success' },
              { id: 'cancelled', label: 'Cancelados', badge: 'bg-danger' },
            ].map((f) => {
              const count =
                f.id === 'todos'
                  ? orders.length
                  : orders.filter((o) => o.status === f.id).length
              return (
                <button
                  key={f.id}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 ${
                    orderFilter === f.id ? 'btn-dark' : 'btn-light border'
                  }`}
                  onClick={() => setOrderFilter(f.id)}
                >
                  {f.label}{' '}
                  <span className="badge bg-secondary ms-1 rounded-pill">{count}</span>
                </button>
              )
            })}
          </div>

          {loadingOrders ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando pedidos...</span>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4">
              <i className="bi bi-inbox text-secondary" style={{ fontSize: '2.5rem' }}></i>
              <h5 className="fw-bold mt-2">No hay pedidos en este estado</h5>
              <p className="text-secondary small mb-0">
                Los nuevos pedidos entrantes aparecerán en esta sección.
              </p>
            </div>
          ) : (
            <div className="row g-3">
              {filteredOrders.map((ord) => {
                const dateStr = ord.created_at
                  ? new Date(ord.created_at).toLocaleString('es-AR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : 'Reciente'

                return (
                  <div key={ord.id} className="col-12 col-lg-6">
                    <div className="card border rounded-4 p-3 shadow-none h-100 bg-white">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="fw-bold fs-5 text-dark">Pedido #{ord.id}</span>
                        <span
                          className={`badge ${
                            ord.status === 'pending'
                              ? 'bg-warning-subtle text-warning border border-warning'
                              : ord.status === 'preparing'
                              ? 'bg-primary-subtle text-primary border border-primary'
                              : ord.status === 'delivering'
                              ? 'bg-info-subtle text-info border border-info'
                              : ord.status === 'delivered'
                              ? 'bg-success-subtle text-success border border-success'
                              : 'bg-danger-subtle text-danger border border-danger'
                          }`}
                        >
                          {ord.status === 'pending' && 'Pendiente'}
                          {ord.status === 'preparing' && 'En Preparación'}
                          {ord.status === 'delivering' && 'En Reparto'}
                          {ord.status === 'delivered' && 'Entregado'}
                          {ord.status === 'cancelled' && 'Cancelado'}
                        </span>
                      </div>

                      <div className="small text-secondary mb-3">
                        <i className="bi bi-clock me-1"></i>
                        {dateStr}
                      </div>

                      {/* Items del pedido */}
                      <div className="bg-light p-2 rounded-3 mb-3">
                        <span className="small fw-semibold text-secondary d-block mb-1">
                          Detalle del pedido:
                        </span>
                        {ord.items && ord.items.length > 0 ? (
                          <ul className="list-unstyled mb-0 small">
                            {ord.items.map((it, idx) => (
                              <li key={idx} className="d-flex justify-content-between py-1 border-bottom-dashed">
                                <span>
                                  <strong>{it.quantity}x</strong> {it.product_name || `Producto #${it.product}`}
                                </span>
                                <span className="text-secondary">${parseFloat(it.unit_price || 0).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="small text-muted">Sin items registrados</span>
                        )}
                      </div>

                      <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                        <span className="fw-bold">Total a cobrar:</span>
                        <span className="fw-bold fs-5 text-primary">${parseFloat(ord.total || 0).toFixed(2)}</span>
                      </div>

                      {/* Motivo de cancelación si la orden fue cancelada */}
                      {ord.status === 'cancelled' && ord.cancellation_reason && (
                        <div className="small text-danger mt-2 pt-2 border-top">
                          <i className="bi bi-x-circle me-1"></i>
                          <strong>Motivo:</strong> {ord.cancellation_reason}
                          {ord.cancelled_product_name && (
                            <span className="badge bg-danger-subtle text-danger ms-2 border border-danger-subtle">
                              Plato pausado: {ord.cancelled_product_name}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Botones de acción del monitor de cocina */}
                      <div className="mt-3 d-flex gap-2 justify-content-end">
                        {ord.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              disabled={updatingOrderId === ord.id}
                              onClick={() => handleOpenRejectModal(ord)}
                            >
                              Rechazar
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              disabled={updatingOrderId === ord.id}
                              onClick={() => handleTransitionOrder(ord.id, 'preparing')}
                            >
                              <i className="bi bi-fire me-1"></i>
                              Aceptar y Preparar
                            </button>
                          </>
                        )}

                        {ord.status === 'preparing' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              disabled={updatingOrderId === ord.id}
                              onClick={() => handleOpenRejectModal(ord)}
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-info text-white"
                              disabled={updatingOrderId === ord.id}
                              onClick={() => handleTransitionOrder(ord.id, 'delivering')}
                            >
                              <i className="bi bi-bicycle me-1"></i>
                              Despachar / En Reparto
                            </button>
                          </>
                        )}

                        {ord.status === 'delivering' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            disabled={updatingOrderId === ord.id}
                            onClick={() => handleTransitionOrder(ord.id, 'delivered')}
                          >
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Marcar Entregado
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Cancelación / Rechazo Reactivo con motivo y apagado de plato */}
      {rejectingOrder && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
          role="dialog"
          aria-labelledby="rejectModalLabel"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger" id="rejectModalLabel">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Rechazar Pedido #{rejectingOrder.id}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setRejectingOrder(null)}
                  aria-label="Cerrar"
                ></button>
              </div>
              <div className="modal-body pt-3">
                <p className="small text-secondary mb-3">
                  Indicá el motivo del rechazo. Si se debe a falta de ingredientes o insumos, el plato seleccionado
                  se pausará automáticamente del menú para evitar que otros clientes lo ordenen.
                </p>

                <div className="mb-3">
                  <label htmlFor="rejectionReasonSelect" className="form-label small fw-semibold text-secondary">
                    Motivo de rechazo *
                  </label>
                  <select
                    id="rejectionReasonSelect"
                    className="form-select"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  >
                    <option value="Falta de insumos / Producto agotado">
                      Falta de insumos / Producto agotado
                    </option>
                    <option value="Demora excesiva en cocina / Saturación">
                      Demora excesiva en cocina / Saturación
                    </option>
                    <option value="Comercio fuera de horario / Cerrando">
                      Comercio fuera de horario / Cerrando
                    </option>
                    <option value="Otro motivo operativo">Otro motivo operativo</option>
                  </select>
                </div>

                {(rejectionReason.includes('insumos') || rejectionReason.includes('agotado')) && (
                  <div className="mb-3">
                    <label htmlFor="rejectionProductSelect" className="form-label small fw-semibold text-secondary">
                      Plato/Producto agotado (se pausará del menú)
                    </label>
                    <select
                      id="rejectionProductSelect"
                      className="form-select"
                      value={rejectionProductId}
                      onChange={(e) => setRejectionProductId(e.target.value)}
                    >
                      <option value="">-- No pausar ningún plato específico --</option>
                      {rejectingOrder.items?.map((it) => (
                        <option key={it.id || it.product} value={it.product}>
                          {it.product_name || `Producto #${it.product}`}
                        </option>
                      ))}
                    </select>
                    <span className="form-text small text-muted">
                      El producto seleccionado pasará automáticamente a &quot;No disponible&quot;.
                    </span>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-3"
                  onClick={() => setRejectingOrder(null)}
                >
                  Volver
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4"
                  disabled={updatingOrderId === rejectingOrder.id}
                  onClick={handleConfirmRejectOrder}
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Tienda */}
      {showStoreModal && (
        <EditarTiendaModal
          store={store}
          onClose={() => setShowStoreModal(false)}
          onSave={handleUpdateStore}
        />
      )}

      {/* Modal Crear / Editar Producto */}
      {showProductModal && (
        <ProductoModal
          product={editingProduct}
          onClose={() => setShowProductModal(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  )
}
