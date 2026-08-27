import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, eyebrow, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined
    const handleKey = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleKey)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.classList.remove('modal-open')
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal modal--${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal__header">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>
        <div className="modal__content">{children}</div>
      </section>
    </div>
  )
}
