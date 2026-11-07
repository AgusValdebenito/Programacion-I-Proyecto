const STATUS_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'pending', label: 'Pendientes', badge: 'bg-warning' },
  { id: 'preparing', label: 'En Preparación', badge: 'bg-primary' },
  { id: 'delivering', label: 'En Reparto', badge: 'bg-info' },
  { id: 'delivered', label: 'Entregados', badge: 'bg-success' },
  { id: 'cancelled', label: 'Cancelados', badge: 'bg-danger' },
]

/**
 * Monitor interactivo de pedidos y cocina para el panel de vendedor.
 */
export default function StoreOrderMonitor({
  orders = [],
  filteredOrders = [],
  loadingOrders = false,
  ordersError = null,
  orderFilter = 'todos',
  onFilterChange,
  onRefresh,
  updatingOrderId = null,
  onOpenRejectModal,
  onTransitionOrder,
}) {
  return (
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
          onClick={onRefresh}
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
            onClick={onRefresh}
            disabled={loadingOrders}
          >
            <i className={`bi bi-arrow-clockwise me-1 ${loadingOrders ? 'spin' : ''}`}></i>
            Reintentar
          </button>
        </div>
      )}

      {/* Filtros por estado */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map((f) => {
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
              onClick={() => onFilterChange(f.id)}
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
                          <li
                            key={idx}
                            className="d-flex justify-content-between py-1 border-bottom-dashed"
                          >
                            <span>
                              <strong>{it.quantity}x</strong>{' '}
                              {it.product_name || `Producto #${it.product}`}
                            </span>
                            <span className="text-secondary">
                              ${parseFloat(it.unit_price || 0).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="small text-muted">Sin items registrados</span>
                    )}
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                    <span className="fw-bold">Total a cobrar:</span>
                    <span className="fw-bold fs-5 text-primary">
                      ${parseFloat(ord.total || 0).toFixed(2)}
                    </span>
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
                          onClick={() => onOpenRejectModal(ord)}
                        >
                          Rechazar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          disabled={updatingOrderId === ord.id}
                          onClick={() => onTransitionOrder(ord.id, 'preparing')}
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
                          onClick={() => onOpenRejectModal(ord)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-info text-white"
                          disabled={updatingOrderId === ord.id}
                          onClick={() => onTransitionOrder(ord.id, 'delivering')}
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
                        onClick={() => onTransitionOrder(ord.id, 'delivered')}
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
  )
}
