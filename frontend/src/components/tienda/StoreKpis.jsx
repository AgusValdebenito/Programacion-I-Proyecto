/**
 * Tarjetas de métricas y KPIs ejecutivos del comercio en el panel de vendedor.
 */
export default function StoreKpis({ stats }) {
  if (!stats) return null

  return (
    <div className="row g-2 g-sm-3 mb-4">
      <div className="col-6 col-lg-3">
        <div className="card border-0 shadow-sm rounded-4 p-2.5 p-sm-3 bg-white h-100">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-secondary small fw-semibold">Platos Publicados</span>
            <div className="bg-primary-subtle text-primary p-2 rounded-3">
              <i className="bi bi-basket2-fill"></i>
            </div>
          </div>
          <h2 className="h4 h-sm-2 fw-bold mb-1 text-truncate">{stats.totalProd}</h2>
          <span className="small text-success">
            <i className="bi bi-check-circle-fill me-1"></i>
            {stats.availableProd} disponibles
          </span>
        </div>
      </div>

      <div className="col-6 col-lg-3">
        <div className="card border-0 shadow-sm rounded-4 p-2.5 p-sm-3 bg-white h-100">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-secondary small fw-semibold">Pedidos Pendientes</span>
            <div className="bg-warning-subtle text-warning p-2 rounded-3">
              <i className="bi bi-hourglass-split"></i>
            </div>
          </div>
          <h2 className="h4 h-sm-2 fw-bold mb-1 text-truncate">{stats.pendingOrders}</h2>
          <span className="small text-muted">Aguardando preparación</span>
        </div>
      </div>

      <div className="col-6 col-lg-3">
        <div className="card border-0 shadow-sm rounded-4 p-2.5 p-sm-3 bg-white h-100">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-secondary small fw-semibold">Total de Pedidos</span>
            <div className="bg-info-subtle text-info p-2 rounded-3">
              <i className="bi bi-receipt"></i>
            </div>
          </div>
          <h2 className="h4 h-sm-2 fw-bold mb-1 text-truncate">{stats.totalOrders}</h2>
          <span className="small text-muted">Historial completo</span>
        </div>
      </div>

      <div className="col-6 col-lg-3">
        <div className="card border-0 shadow-sm rounded-4 p-2.5 p-sm-3 bg-white h-100">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-secondary small fw-semibold">Ventas Entregadas</span>
            <div className="bg-success-subtle text-success p-2 rounded-3">
              <i className="bi bi-currency-dollar"></i>
            </div>
          </div>
          <h2 className="h4 h-sm-2 fw-bold mb-1 text-truncate">
            ${(stats.totalRevenue || 0).toFixed(2)}
          </h2>
          <span className="small text-success">Órdenes completadas</span>
        </div>
      </div>
    </div>
  )
}
