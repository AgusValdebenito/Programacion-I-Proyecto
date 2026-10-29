import { useState } from 'react'

/**
 * Modal interactivo para rechazo y cancelación de pedidos en cocina (Milestone 4 - Issue #22).
 *
 * Permite al comercio especificar el motivo del rechazo y, en caso de quiebre de insumos,
 * pausar automáticamente el plato causante (`is_available = False`).
 *
 * @param {Object} props
 * @param {Object|null} props.order - Pedido a rechazar
 * @param {boolean} props.isOpen - Si el modal está visible
 * @param {boolean} [props.isSubmitting=false] - Si la petición está en progreso
 * @param {Function} props.onClose - Callback al cerrar el modal
 * @param {Function} props.onConfirm - Callback al confirmar: ({ reason, productId }) => void
 */
export default function RejectOrderModal({
  order,
  isOpen,
  isSubmitting = false,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState('Falta de insumos / Producto agotado')
  const [productId, setProductId] = useState(() => {
    const firstItemProdId = order?.items?.[0]?.product || ''
    return firstItemProdId ? String(firstItemProdId) : ''
  })

  if (!isOpen || !order) return null

  const isOutOfStockReason = reason.includes('insumos') || reason.includes('agotado')

  const handleConfirm = () => {
    onConfirm({
      reason,
      productId: isOutOfStockReason && productId ? Number(productId) : null,
    })
  }

  return (
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
              <i className="bi bi-exclamation-triangle-fill me-2" />
              Rechazar Pedido #{order.id}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Cerrar"
            />
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
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
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

            {isOutOfStockReason && (
              <div className="mb-3">
                <label htmlFor="rejectionProductSelect" className="form-label small fw-semibold text-secondary">
                  Plato/Producto agotado (se pausará del menú)
                </label>
                <select
                  id="rejectionProductSelect"
                  className="form-select"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">-- No pausar ningún plato específico --</option>
                  {order.items?.map((it) => (
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
              onClick={onClose}
              disabled={isSubmitting}
            >
              Volver
            </button>
            <button
              type="button"
              className="btn btn-danger rounded-pill px-4"
              disabled={isSubmitting}
              onClick={handleConfirm}
            >
              {isSubmitting ? 'Cancelando...' : 'Confirmar Rechazo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
