import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)

  // Mantiene la referencia actualizada sin reiniciar el efecto en cada tecla.
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current()
    }

    document.addEventListener('keydown', handleKeyDown)
    const focusTimer = setTimeout(() => panelRef.current?.focus(), 30)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      clearTimeout(focusTimer)
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={panelRef}
        className={`modal ${size === 'sm' ? 'modal--sm' : size === 'lg' ? 'modal--lg' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <header className="modal__header">
          <div>
            <h2 className="modal__title" id="modal-title">
              {title}
            </h2>
            {subtitle ? <p className="modal__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar ventana">
            <X />
          </button>
        </header>

        <div className="modal__body">{children}</div>

        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  )
}
