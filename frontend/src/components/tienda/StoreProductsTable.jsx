import { getImageUrl } from '../../utils/imageUrl'
import { formatPrice } from '../../utils/formatters'

/**
 * Tabla y gestión del catálogo de productos para el panel de vendedor.
 */
export default function StoreProductsTable({
  filteredProducts = [],
  loadingProducts = false,
  productsError = null,
  productSearch = '',
  onSearchChange,
  onRefresh,
  onNewProduct,
  onLoadSampleProducts,
  onEditProduct,
  onDeleteProduct,
  onToggleAvailability,
  deletingProductId = null,
}) {
  return (
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
            onClick={onRefresh}
            disabled={loadingProducts}
            title="Actualizar catálogo de productos"
          >
            <i className={`bi bi-arrow-clockwise me-1 ${loadingProducts ? 'spin' : ''}`}></i>
            Actualizar
          </button>
          <button
            type="button"
            className="btn btn-primary rounded-pill px-3 fw-semibold"
            onClick={onNewProduct}
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
            onClick={onRefresh}
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
            onChange={(e) => onSearchChange(e.target.value)}
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
            {productSearch
              ? 'Probá con otro término de búsqueda.'
              : 'Todavía no agregaste ningún plato a tu menú.'}
          </p>
          {!productSearch && (
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-pill px-3"
                onClick={onNewProduct}
              >
                Agregar primer producto
              </button>
              {onLoadSampleProducts && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-pill px-3"
                  disabled={loadingProducts}
                  onClick={onLoadSampleProducts}
                >
                  <i className="bi bi-stars me-1"></i>
                  Cargar 3 platos de muestra
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="table-responsive fr-horizontal-scroll">
          <table className="table table-hover align-middle mb-0 fr-admin-table">
            <thead className="table-light">
              <tr>
                <th scope="col" style={{ width: '48px' }}>Foto</th>
                <th scope="col">Nombre & Descripción</th>
                <th scope="col" className="text-nowrap">Precio</th>
                <th scope="col" className="text-nowrap">Stock</th>
                <th scope="col" className="text-nowrap">Estado</th>
                <th scope="col" className="text-end text-nowrap">Acciones</th>
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
                      style={{ width: '42px', height: '42px' }}
                      onError={(e) => {
                        e.target.src = '/images/placeholder-product.svg'
                      }}
                    />
                  </td>
                  <td>
                    <div
                      className="fw-bold text-dark text-truncate"
                      style={{ maxWidth: 'clamp(140px, 22vw, 320px)' }}
                      title={prod.name}
                    >
                      {prod.name}
                    </div>
                    <div
                      className="small text-secondary text-truncate"
                      style={{ maxWidth: 'clamp(140px, 25vw, 360px)' }}
                      title={prod.description}
                    >
                      {prod.description || 'Sin descripción'}
                    </div>
                  </td>
                  <td className="fw-bold text-primary text-nowrap">
                    {formatPrice(prod.price)}
                  </td>
                  <td className="text-nowrap">
                    <span
                      className={`badge ${
                        prod.stock > 5
                          ? 'bg-success-subtle text-success'
                          : prod.stock > 0
                          ? 'bg-warning-subtle text-warning'
                          : 'bg-danger-subtle text-danger'
                      }`}
                    >
                      {prod.stock} u.
                    </span>
                  </td>
                  <td>
                    <div className="form-check form-switch m-0 d-inline-flex align-items-center">
                      <input
                        className="form-check-input cursor-pointer"
                        type="checkbox"
                        role="switch"
                        id={`switch-${prod.id}`}
                        checked={prod.is_available}
                        onChange={() => onToggleAvailability(prod)}
                      />
                      <label
                        className="form-check-label small cursor-pointer d-none d-lg-inline ms-1"
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
                    <div className="btn-group btn-group-sm text-nowrap">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        title="Editar plato"
                        onClick={() => onEditProduct(prod)}
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
                            onDeleteProduct(prod.id)
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
  )
}
