import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { storeService } from '../services/storeService'
import { productService } from '../services/productService'
import { orderService } from '../services/orderService'
import { getImageUrl } from '../utils/imageUrl'
import EditarTiendaModal from '../components/tienda/EditarTiendaModal'
import ProductoModal from '../components/tienda/ProductoModal'
import RejectOrderModal from '../components/tienda/RejectOrderModal'
import StoreKpis from '../components/tienda/StoreKpis'
import StoreProductsTable from '../components/tienda/StoreProductsTable'
import StoreOrderMonitor from '../components/tienda/StoreOrderMonitor'

/**
 * Panel de Administración y Despacho del Vendedor (TP9 - Milestone 3, Issues #19, #20, #21).
 * Orquesta el estado global del local, las pestañas y los modales delegando vistas especializadas.
 */
export default function PanelTienda() {
  const navigate = useNavigate()
  const { user, getToken, updateUser } = useAuth()

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
  const [orderFilter, setOrderFilter] = useState('todos')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  // Cancelación / Rechazo reactivo (Milestone 4, Issues #22 y #23)
  const [rejectingOrder, setRejectingOrder] = useState(null)

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

  // Carga de productos de muestra
  const handleLoadSampleProducts = async () => {
    setLoadingProducts(true)
    const token = getToken()
    const sampleProducts = [
      {
        name: 'Hamburguesa Especial Doble',
        description: 'Carne vacuna, doble queso cheddar, lechuga y tomate.',
        price: '5500.00',
        stock: 20,
        is_available: true,
        image: 'products/crazy_burger_simple.jpg',
      },
      {
        name: 'Papas Fritas Clásicas',
        description: 'Porción crocante de papas fritas caseras.',
        price: '2500.00',
        stock: 30,
        is_available: true,
        image: 'products/papas_fritas_clasicas.jpg',
      },
      {
        name: 'Gaseosa Cola 500ml',
        description: 'Bebida fría en botella de 500ml.',
        price: '1500.00',
        stock: 40,
        is_available: true,
        image: 'products/gaseosa_cola_500ml.jpg',
      },
    ]
    for (const p of sampleProducts) {
      await productService.createProduct({ ...p, store: store.id }, token)
    }
    await fetchProducts()
  }

  // Transición de estado de pedido (Cocina)
  const handleTransitionOrder = async (orderId, newStatus, extraData = {}) => {
    const token = getToken()
    setActionError(null)
    setUpdatingOrderId(orderId)
    const result =
      Object.keys(extraData).length > 0
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
          prev.map((p) =>
            p.id === Number(extraData.cancelled_product) ? { ...p, is_available: false } : p
          )
        )
      }
    } else {
      setActionError(result.error || 'No se pudo actualizar el estado del pedido.')
    }
  }

  // Apertura del modal de rechazo
  const handleOpenRejectModal = (ord) => {
    setRejectingOrder(ord)
  }

  // Confirmar rechazo de orden
  const handleConfirmRejectOrder = async ({ reason, productId }) => {
    if (!rejectingOrder) return
    const extraData = {
      cancellation_reason: reason,
    }
    if (productId) {
      extraData.cancelled_product = productId
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

              <div className="alert alert-info py-2 px-3 small text-start border-0 bg-info-subtle text-info-emphasis rounded-3 mb-3">
                <i className="bi bi-info-circle-fill me-2"></i>
                Estás a un paso de abrir tu comercio. Tu cuenta seguirá siendo de <strong>cliente</strong> hasta que confirmes la creación de la tienda.
              </div>

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
                  type="button"
                  className="btn btn-outline-secondary btn-sm w-100 mb-3 rounded-pill"
                  onClick={() => {
                    setNewStoreName('La Cocina de ' + (user?.name || 'Demostración'))
                    setNewStoreDesc('Comidas caseras gourmet, minutas al momento y bebidas frescas.')
                    setNewStoreImage('stores/crazy_burgers.jpg')
                  }}
                >
                  <i className="bi bi-magic me-1"></i>
                  Completar datos de ejemplo para demostración
                </button>
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
                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-link text-secondary text-decoration-none small"
                    onClick={() => navigate('/')}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Cancelar y seguir comprando como cliente
                  </button>
                </div>
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
        <div
          className="alert alert-danger alert-dismissible fade show rounded-3 mb-4 d-flex align-items-center justify-content-between"
          role="alert"
        >
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
      <ul
        className="nav nav-pills gap-1 gap-md-2 mb-4 p-1 bg-white fr-nav-pills-container shadow-sm border d-flex flex-nowrap fr-horizontal-scroll align-items-center"
        role="tablist"
      >
        <li className="nav-item flex-shrink-0" role="presentation">
          <button
            type="button"
            className={`nav-link rounded-pill px-3 px-md-4 py-2 fw-semibold text-nowrap ${
              activeTab === 'resumen' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('resumen')}
          >
            <i className="bi bi-speedometer2 me-1 me-md-2"></i>
            Resumen
          </button>
        </li>
        <li className="nav-item flex-shrink-0" role="presentation">
          <button
            type="button"
            className={`nav-link rounded-pill px-3 px-md-4 py-2 fw-semibold text-nowrap ${
              activeTab === 'menu' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('menu')}
          >
            <i className="bi bi-card-list me-1 me-md-2"></i>
            Menú y Productos
            {products.length > 0 && (
              <span className="badge bg-secondary ms-1 ms-md-2">{products.length}</span>
            )}
          </button>
        </li>
        <li className="nav-item flex-shrink-0" role="presentation">
          <button
            type="button"
            className={`nav-link rounded-pill px-3 px-md-4 py-2 fw-semibold text-nowrap ${
              activeTab === 'pedidos' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('pedidos')}
          >
            <i className="bi bi-bell-fill me-1 me-md-2"></i>
            Monitor de Pedidos
            {stats.pendingOrders > 0 && (
              <span className="badge bg-danger ms-1 ms-md-2">{stats.pendingOrders}</span>
            )}
          </button>
        </li>
      </ul>

      {/* TAB 1: RESUMEN / KPIS */}
      {activeTab === 'resumen' && <StoreKpis stats={stats} />}

      {/* TAB 2: GESTIÓN DE MENÚ / CATÁLOGO (ISSUE #20) */}
      {activeTab === 'menu' && (
        <StoreProductsTable
          filteredProducts={filteredProducts}
          loadingProducts={loadingProducts}
          productsError={productsError}
          productSearch={productSearch}
          onSearchChange={setProductSearch}
          onRefresh={fetchProducts}
          onNewProduct={() => {
            setEditingProduct(null)
            setShowProductModal(true)
          }}
          onLoadSampleProducts={handleLoadSampleProducts}
          onEditProduct={(prod) => {
            setEditingProduct(prod)
            setShowProductModal(true)
          }}
          onDeleteProduct={handleDeleteProduct}
          onToggleAvailability={handleToggleAvailability}
          deletingProductId={deletingProductId}
        />
      )}

      {/* TAB 3: MONITOR DE PEDIDOS Y COCINA (ISSUE #21) */}
      {activeTab === 'pedidos' && (
        <StoreOrderMonitor
          orders={orders}
          filteredOrders={filteredOrders}
          loadingOrders={loadingOrders}
          ordersError={ordersError}
          orderFilter={orderFilter}
          onFilterChange={setOrderFilter}
          onRefresh={fetchOrders}
          updatingOrderId={updatingOrderId}
          onOpenRejectModal={handleOpenRejectModal}
          onTransitionOrder={handleTransitionOrder}
        />
      )}

      {/* Modal de Cancelación / Rechazo Reactivo (Issue #22) */}
      <RejectOrderModal
        order={rejectingOrder}
        isOpen={Boolean(rejectingOrder)}
        isSubmitting={updatingOrderId === rejectingOrder?.id}
        onClose={() => setRejectingOrder(null)}
        onConfirm={handleConfirmRejectOrder}
      />

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
