import { useState } from 'react'
import { orderService } from '../services/orderService'
import { useAuth } from '../hooks/useAuth'

const POSITIVE_TAGS = [
  'Comida caliente',
  'Entrega rápida',
  'Excelente packaging',
  'Muy rico',
  'Buena porción',
  'Atención cordial',
]

const NEGATIVE_TAGS = [
  'Llegó frío',
  'Demora excesiva',
  'Pedido incompleto',
  'Mala presentación',
  'Packaging dañado',
  'Sabor no esperado',
]

const RATING_LABELS = {
  1: 'Muy malo 😞',
  2: 'Malo 😕',
  3: 'Regular 😐',
  4: 'Muy bueno 😊',
  5: '¡Excelente! 🤩',
}

/**
 * Modal interactivo para calificar pedidos entregados (Milestone 7 - Issue #44).
 *
 * @param {Object} props
 * @param {Object} props.order - Pedido a calificar
 * @param {boolean} props.isOpen - Si el modal está visible
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Function} props.onRatingSubmitted - Callback al guardar calificación
 */
export default function RatingModal({
  order,
  isOpen,
  onClose,
  onRatingSubmitted,
}) {
  const { getValidToken } = useAuth()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState([])
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !order) return null

  const activeRating = hoverRating || rating
  const availableTags = activeRating >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) {
      setError('Por favor seleccioná una puntuación de 1 a 5 estrellas.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const token = await getValidToken()
      if (!token) {
        setError('Tu sesión no es válida. Por favor iniciá sesión nuevamente.')
        setSubmitting(false)
        return
      }

      const payload = {
        rating,
        tags: selectedTags,
        comment: comment.trim() || undefined,
      }

      const res = await orderService.rateOrder(order.id, payload, token)
      if (res.success && res.data) {
        if (onRatingSubmitted) {
          onRatingSubmitted(res.data)
        }
        onClose()
      } else {
        setError(res.error || 'No se pudo registrar la calificación.')
      }
    } catch {
      setError('Error de conexión al enviar la calificación.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header border-0 bg-light p-4 pb-3">
            <div>
              <h2 className="modal-title h5 fw-bold text-dark mb-1">
                ¿Cómo estuvo tu pedido?
              </h2>
              <p className="text-secondary small mb-0">
                Pedido <strong>#{order.id}</strong> en <strong>{order.store_name}</strong>
              </p>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar modal de calificación"
              onClick={onClose}
              disabled={submitting}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 pt-3">
              {error && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-circle-fill me-2" />
                  <span>{error}</span>
                </div>
              )}

              {/* Selector de Estrellas */}
              <div className="text-center my-3">
                <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="btn p-1 border-0 bg-transparent text-warning"
                      style={{ fontSize: '2.2rem', transition: 'transform 0.15s ease' }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      aria-label={`Calificar con ${star} estrellas`}
                    >
                      <i
                        className={`bi ${
                          star <= (hoverRating || rating)
                            ? 'bi-star-fill'
                            : 'bi-star'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="badge bg-light text-dark border px-3 py-2 fw-semibold fs-6">
                  {RATING_LABELS[activeRating] || 'Elegí una puntuación'}
                </span>
              </div>

              {/* Chips de Motivos */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary text-uppercase tracking-wide mb-2 d-block">
                  ¿Qué destacarías de la experiencia?
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`btn rounded-pill btn-sm px-3 py-1 transition-all ${
                          isSelected
                            ? 'btn-primary shadow-sm'
                            : 'btn-outline-secondary'
                        }`}
                        onClick={() => handleTagToggle(tag)}
                      >
                        {isSelected && <i className="bi bi-check2 me-1" />}
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Textarea de Comentario Opcional */}
              <div className="mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label htmlFor="rating-comment" className="form-label small fw-bold text-secondary mb-0">
                    Comentario adicional (opcional)
                  </label>
                  <span className="text-muted small">{comment.length}/300</span>
                </div>
                <textarea
                  id="rating-comment"
                  className="form-control rounded-3"
                  rows="3"
                  maxLength="300"
                  placeholder="Contanos más detalles sobre los platos o el servicio..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 bg-light p-3 px-4 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light rounded-pill px-4"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4 shadow-sm"
                disabled={submitting || rating === 0}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Enviando...
                  </>
                ) : (
                  'Enviar calificación'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
