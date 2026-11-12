import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const remove = useCallback((id) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (message, type = 'success') => {
      const id = ++nextId
      setToasts((current) => [...current, { id, message, type }])

      const timer = setTimeout(() => remove(id), 4500)
      timers.current.set(id, timer)
    },
    [remove],
  )

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer))
      timers.current.clear()
    },
    [],
  )

  const value = useMemo(
    () => ({
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
      info: (message) => push(message, 'info'),
    }),
    [push],
  )

  const viewport = createPortal(
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] ?? Info
        return (
          <div key={toast.id} className={`toast toast--${toast.type}`} role="status">
            <span className="toast__icon" aria-hidden="true">
              <Icon />
            </span>
            <span className="toast__content">{toast.message}</span>
            <button
              type="button"
              className="toast__close"
              onClick={() => remove(toast.id)}
              aria-label="Cerrar notificación"
            >
              <X />
            </button>
            <span className="toast__progress" aria-hidden="true" />
          </div>
        )
      })}
    </div>,
    document.body,
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {viewport}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return context
}
