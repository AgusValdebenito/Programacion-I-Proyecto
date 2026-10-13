import { useState } from 'react'

/**
 * Modal para creación y edición de productos en el menú del comercio (TP9 - Milestone 3).
 */
export default function ProductoModal({ product, onClose, onSave }) {
  const isEditing = Boolean(product && product.id)
  const [name, setName] = useState(product?.name || '')
  const [description, setDescription] = useState(product?.description || '')
  const [price, setPrice] = useState(product?.price != null ? String(product.price) : '')
  const [stock, setStock] = useState(product?.stock != null ? String(product.stock) : '10')
  const [isAvailable, setIsAvailable] = useState(product?.is_available !== false)
  const [image, setImage] = useState(product?.image || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre del producto es obligatorio.')
      return
    }

    const numPrice = parseFloat(price)
    if (isNaN(numPrice) || numPrice < 0) {
      setError('El precio debe ser un número mayor o igual a 0.')
      return
    }

    const numStock = parseInt(stock, 10)
    if (isNaN(numStock) || numStock < 0) {
      setError('El stock debe ser un número entero mayor o igual a 0.')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: numPrice.toFixed(2),
      stock: numStock,
      is_available: isAvailable,
    }

    if (image && image.trim() && image.trim() !== product?.image) {
      payload.image = image.trim()
    }

    const result = await onSave(payload, product?.id)
    setSaving(false)

    if (result && !result.success) {
      setError(result.error || 'Error al guardar el producto.')
    } else {
      onClose()
    }
  }

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="productModalTitle"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold" id="productModalTitle">
              <i className={`bi ${isEditing ? 'bi-pencil-square' : 'bi-plus-circle'} me-2 text-primary`}></i>
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={onClose}
              disabled={saving}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body py-3">
              {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="prodNameInput" className="form-label small fw-semibold text-secondary">
                  Nombre del Producto *
                </label>
                <input
                  id="prodNameInput"
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Burger Clásica con Cheddar"
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label htmlFor="prodPriceInput" className="form-label small fw-semibold text-secondary">
                    Precio ($ ARS) *
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      id="prodPriceInput"
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="prodStockInput" className="form-label small fw-semibold text-secondary">
                    Stock Disponible *
                  </label>
                  <input
                    id="prodStockInput"
                    type="number"
                    min="0"
                    className="form-control"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="10"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="prodDescInput" className="form-label small fw-semibold text-secondary">
                  Descripción / Ingredientes
                </label>
                <textarea
                  id="prodDescInput"
                  className="form-control"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredientes, detalles de preparación o guarnición..."
                ></textarea>
              </div>

              <div className="mb-3">
                <label htmlFor="prodImageInput" className="form-label small fw-semibold text-secondary">
                  URL de Imagen del Producto
                </label>
                <input
                  id="prodImageInput"
                  type="text"
                  className="form-control"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Ej. https://ejemplo.com/foto.jpg o /images/products/hamburguesa.jpg"
                />
                <div className="form-text small">
                  Opcional: podés ingresar una URL pública de internet o una ruta local.
                </div>
              </div>

              <div className="form-check form-switch p-3 bg-light rounded-3">
                <input
                  className="form-check-input ms-0 me-2"
                  type="checkbox"
                  role="switch"
                  id="prodAvailableSwitch"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                />
                <label className="form-check-label fw-semibold" htmlFor="prodAvailableSwitch">
                  Disponible para ordenar inmediatamente
                </label>
                <div className="text-muted small ps-4">
                  Si apagás esta opción, los clientes verán el plato como agotado en tu carta.
                </div>
              </div>
            </div>

            <div className="modal-footer border-top-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-3"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4 fw-semibold text-white"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : isEditing ? (
                  'Guardar Cambios'
                ) : (
                  'Crear Producto'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
