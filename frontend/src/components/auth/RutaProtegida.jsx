import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'
import Loader from '../ui/Loader.jsx'

function inicioPorRol(rol) {
  return rol === 'estudiante' ? '/mi-panel' : '/'
}

export default function RutaProtegida({ roles, children }) {
  const { usuario, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="auth-loading">
        <Loader text="Comprobando tu sesión…" />
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to={inicioPorRol(usuario.rol)} replace />
  }

  return children
}

export function SoloPublico({ children }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="auth-loading">
        <Loader text="Comprobando tu sesión…" />
      </div>
    )
  }

  if (usuario) {
    return <Navigate to={inicioPorRol(usuario.rol)} replace />
  }

  return children
}
