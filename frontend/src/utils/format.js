export function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function shortId(id) {
  if (!id) return '—'
  return `…${String(id).slice(-6)}`
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function getInitials(nombres = '', apellidos = '') {
  const first = nombres.trim().charAt(0)
  const last = apellidos.trim().charAt(0)
  return `${first}${last}`.toUpperCase() || 'NA'
}

export const NIVELES = [
  { value: 'pregrado', label: 'Pregrado', variant: 'blue' },
  { value: 'posgrado', label: 'Posgrado', variant: 'teal' },
  { value: 'otros', label: 'Otros', variant: 'gold' },
]

export function nivelInfo(value) {
  return NIVELES.find((nivel) => nivel.value === value) ?? { value, label: value || 'Sin nivel', variant: 'slate' }
}

export const TIPOS_DOCUMENTO = ['CC', 'TI', 'CE', 'PA']

export function tipoDocumentoLabel(value) {
  const labels = {
    CC: 'Cédula de ciudadanía',
    TI: 'Tarjeta de identidad',
    CE: 'Cédula de extranjería',
    PA: 'Pasaporte',
  }

  return labels[value] ?? value ?? '—'
}

export function getErrorMessage(error) {
  return error?.message || 'Ocurrió un error inesperado.'
}
