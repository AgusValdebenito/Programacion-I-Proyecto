import { useState } from 'react'

/**
 * Modal para editar la información de la tienda del vendedor (TP9 - Milestone 3).
 */
export default function EditarTiendaModal({ store, onClose, onSave }) {
  const [name, setName] = useState(store?.name || '')
  const [description, setDescription] = useState(store?.description || '')
  const [image, setImage] = useState(store?.image || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre de la tienda es obligatorio.')
      return
    }

    setSaving(true)
    setError(null)
    const result = await onSave({
      name: name.trim(),
      description: description.trim(),
      image: image.trim() || undefined,
    })
    setSaving(false)

    if (result && !result.success) {
      setError(result.error || 'Error al guardar los cambios')
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
      aria-labelledby="storeModalTitle"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold" id="storeModalTitle">
              <i className="bi bi-shop me-2 text-primary"></i>
              Editar Información de la Tienda
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
                <label htmlFor="storeNameInput" className="form-label small fw-semibold text-secondary">
                  Nombre de la Tienda *
                </label>
                <input
                  id="storeNameInput"
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Pizzería Don Juan"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="storeDescInput" className="form-label small fw-semibold text-secondary">
                  Descripción
                </label>
                <textarea
                  id="storeDescInput"
                  className="form-control"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve reseña sobre tus especialidades y cocina..."
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="storeImageInput" className="form-label small fw-semibold text-secondary">
                  URL del Logo o Imagen
                </label>
                <input
                  id="storeImageInput"
                  type="text"
                  className="form-control"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Ej. https://ejemplo.com/logo.jpg o /images/stores/mi-local.jpg"
                />
                <div className="form-text small">
                  Opcional: podés ingresar una URL pública de internet o una ruta de imagen local.
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
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
