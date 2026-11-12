import { obtenerAvatar } from '../../assets/avatars/index.js'

function iniciales(nombre = '', apellidos = '') {
  const nombreLimpio = nombre.trim()
  const apellidosLimpios = apellidos.trim()

  if (nombreLimpio && apellidosLimpios) {
    return `${nombreLimpio.charAt(0)}${apellidosLimpios.charAt(0)}`.toUpperCase()
  }

  const partes = nombreLimpio.split(/\s+/).filter(Boolean)
  const primera = partes[0]?.charAt(0) ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : ''
  return `${primera}${ultima}`.toUpperCase() || 'U'
}

export default function Avatar({
  avatar,
  nombre = '',
  apellidos = '',
  className = 'avatar',
  alt,
  ...rest
}) {
  const info = obtenerAvatar(avatar)
  const esDecorativo = !alt

  return (
    <span
      className={`${className}${info ? ' avatar-photo' : ''}`}
      aria-hidden={esDecorativo ? 'true' : undefined}
      {...rest}
    >
      {info ? (
        <img className="avatar-photo__img" src={info.src} alt={alt ?? ''} loading="lazy" />
      ) : (
        iniciales(nombre, apellidos)
      )}
    </span>
  )
}
