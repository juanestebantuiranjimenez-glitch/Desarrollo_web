import { AlertTriangle } from 'lucide-react'

import Modal from './Modal.jsx'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar eliminación',
  description,
  confirmLabel = 'Eliminar',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner spinner--sm" aria-hidden="true" /> : null}
            {loading ? 'Eliminando…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="confirm-copy">
        <span className="confirm-icon" aria-hidden="true">
          <AlertTriangle />
        </span>
        <p>{description}</p>
      </div>
    </Modal>
  )
}
