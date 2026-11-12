import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { authApi, borrarToken, guardarToken, hayToken } from '../api/client.js'

const AuthContext = createContext(null)

const ESTADO_INICIAL = {
  usuario: null,
  estudiante: null,
  cargando: true,
  sesionExpirada: false,
}

export function AuthProvider({ children }) {
  const [estado, setEstado] = useState(ESTADO_INICIAL)

  useEffect(() => {
    let activo = true

    async function recuperarSesion() {
      if (!hayToken()) {
        if (activo) setEstado({ ...ESTADO_INICIAL, cargando: false })
        return
      }

      try {
        const respuesta = await authApi.perfil()

        if (!activo) return
        setEstado({
          usuario: respuesta?.data?.usuario ?? null,
          estudiante: respuesta?.data?.estudiante ?? null,
          cargando: false,
          sesionExpirada: false,
        })
      } catch {
        if (!activo) return
        borrarToken()
        setEstado({ ...ESTADO_INICIAL, cargando: false })
      }
    }

    recuperarSesion()

    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    const cerrarPorExpiracion = () => {
      borrarToken()
      setEstado({ ...ESTADO_INICIAL, cargando: false, sesionExpirada: true })
    }

    window.addEventListener('admitidos:sesion-expirada', cerrarPorExpiracion)
    return () => window.removeEventListener('admitidos:sesion-expirada', cerrarPorExpiracion)
  }, [])

  const iniciarSesion = useCallback(async (credenciales) => {
    const respuesta = await authApi.login(credenciales)
    const { token, usuario, estudiante } = respuesta.data

    guardarToken(token)
    setEstado({
      usuario,
      estudiante: estudiante ?? null,
      cargando: false,
      sesionExpirada: false,
    })

    return usuario
  }, [])

  const registrarEstudiante = useCallback(async (datos) => {
    const respuesta = await authApi.registrarEstudiante(datos)
    const { token, usuario, estudiante } = respuesta.data

    guardarToken(token)
    setEstado({
      usuario,
      estudiante: estudiante ?? null,
      cargando: false,
      sesionExpirada: false,
    })

    return usuario
  }, [])

  const actualizarAvatar = useCallback(async (avatar) => {
    const respuesta = await authApi.actualizarAvatar(avatar)
    const { usuario, estudiante } = respuesta?.data ?? {}

    setEstado((actual) => ({
      ...actual,
      usuario: usuario ?? actual.usuario,
      estudiante: estudiante ?? actual.estudiante,
    }))

    return usuario
  }, [])

  const cerrarSesion = useCallback(() => {
    borrarToken()
    setEstado({ ...ESTADO_INICIAL, cargando: false })
  }, [])

  const valor = useMemo(
    () => ({
      usuario: estado.usuario,
      estudiante: estado.estudiante,
      cargando: estado.cargando,
      sesionExpirada: estado.sesionExpirada,
      autenticado: Boolean(estado.usuario),
      esAdmin: estado.usuario?.rol === 'admin',
      esEstudiante: estado.usuario?.rol === 'estudiante',
      iniciarSesion,
      registrarEstudiante,
      actualizarAvatar,
      cerrarSesion,
    }),
    [estado, iniciarSesion, registrarEstudiante, actualizarAvatar, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)

  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return contexto
}
