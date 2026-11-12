import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="not-found">
      <span className="not-found__code" aria-hidden="true">
        404
      </span>
      <h1>Esta página no existe</h1>
      <p>
        La dirección que abriste no corresponde a ninguna sección del panel. Vuelve al resumen para
        continuar.
      </p>
      <Link to="/" className="btn btn--primary">
        <ArrowLeft />
        Volver al resumen
      </Link>
      <span className="row muted mt-3" style={{ fontSize: '0.74rem' }}>
        <Compass size={14} aria-hidden="true" />
        Facultades, programas y estudiantes
      </span>
    </div>
  )
}
