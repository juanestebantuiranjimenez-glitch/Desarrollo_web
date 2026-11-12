import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorBanner({ error, onRetry, title = 'No se pudo cargar la información' }) {
  return (
    <div className="banner banner--error" role="alert">
      <AlertCircle aria-hidden="true" />
      <div className="banner__content">
        <strong>{title}.</strong> {error?.message}
      </div>
      {onRetry ? (
        <button type="button" className="btn btn--sm btn--ghost" onClick={onRetry}>
          <RefreshCw />
          Reintentar
        </button>
      ) : null}
    </div>
  )
}
