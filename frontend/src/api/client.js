const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

const TOKEN_KEY = 'admitidos.token'
let tokenEnMemoria = null

function leerToken() {
  if (tokenEnMemoria) return tokenEnMemoria

  try {
    tokenEnMemoria = window.localStorage.getItem(TOKEN_KEY)
  } catch {
    tokenEnMemoria = null
  }

  return tokenEnMemoria
}

export function guardarToken(token) {
  tokenEnMemoria = token

  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Si el navegador bloquea localStorage, la sesión dura lo que dure la pestaña.
  }
}

export function borrarToken() {
  guardarToken(null)
}

export function hayToken() {
  return Boolean(leerToken())
}

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(endpoint, { method = 'GET', body, headers, signal } = {}) {
  const options = {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  }

  const token = leerToken()
  if (token) options.headers.Authorization = `Bearer ${token}`

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options)
    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json') ? await response.json() : null

    if (!response.ok) {
      // La sesión dejó de ser válida: avisamos al AuthContext para cerrarla.
      if (
        response.status === 401 &&
        token &&
        !endpoint.startsWith('/auth/login') &&
        !endpoint.startsWith('/auth/register')
      ) {
        window.dispatchEvent(new CustomEvent('admitidos:sesion-expirada'))
      }

      throw new ApiError(
        data?.message || `La API respondió con el código ${response.status}`,
        response.status,
        data,
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error.name === 'AbortError') throw error

    throw new ApiError(
      'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      0,
      null,
    )
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, options),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
}

function crearRecurso(base) {
  return {
    listar: () => api.get(`${base}/show/`),
    obtener: (id) => api.get(`${base}/info/${id}`),
    crear: (datos) => api.post(`${base}/create/`, datos),
    actualizar: (id, datos) => api.put(`${base}/update/${id}`, datos),
    eliminar: (id) => api.delete(`${base}/delete/${id}`),
  }
}

export const facultadesApi = crearRecurso('/facultades')
export const programasApi = crearRecurso('/programas')
export const estudiantesApi = crearRecurso('/estudiantes')

export const authApi = {
  login: (credenciales) => api.post('/auth/login', credenciales),
  perfil: () => api.get('/auth/me'),
  actualizarAvatar: (avatar) => api.put('/auth/me/avatar', { avatar }),
  programasParaRegistro: () => api.get('/auth/programas'),
  registrarEstudiante: (datos) => api.post('/auth/register/estudiante', datos),
  registrarAdministrador: (datos) => api.post('/auth/register/admin', datos),
  listarAdministradores: () => api.get('/auth/admins'),
}
