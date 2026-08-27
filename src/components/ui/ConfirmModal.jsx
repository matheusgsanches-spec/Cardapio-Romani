import Button from './Button'
import Modal from './Modal'

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="modal-message">{message}</p>
      <div className="modal-actions">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
