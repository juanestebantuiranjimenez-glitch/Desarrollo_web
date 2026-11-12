import { useState } from 'react'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'
import Avatar from '../ui/Avatar.jsx'
import AvatarPicker from '../ui/AvatarPicker.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'

const PAGE_NAMES = {
  '/': 'Resumen general',
  '/mi-panel': 'Mi panel',
  '/facultades': 'Facultades',
  '/programas': 'Programas',
  '/estudiantes': 'Estudiantes',
  '/administradores': 'Administradores',
}

function usePageName() {
  const { pathname } = useLocation()
  return PAGE_NAMES[pathname] ?? 'Página no encontrada'
}

export default function Topbar({
  onMenu,
  mobile = false,
  sidebarCollapsed = false,
  menuExpanded = true,
}) {
  const pageName = usePageName()
  const { usuario, esAdmin } = useAuth()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [today] = useState(() =>
    new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date()),
  )

  const IconoMenu = mobile ? Menu : sidebarCollapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="icon-btn topbar__menu"
          onClick={onMenu}
          aria-label={
            mobile
              ? menuExpanded
                ? 'Cerrar menú'
                : 'Abrir menú'
              : sidebarCollapsed
                ? 'Expandir panel lateral'
                : 'Contraer panel lateral'
          }
          aria-controls="app-sidebar"
          aria-expanded={menuExpanded}
          data-tooltip={
            mobile
              ? menuExpanded
                ? 'Cerrar menú'
                : 'Abrir menú'
              : sidebarCollapsed
                ? 'Expandir panel'
                : 'Contraer panel'
          }
          data-tooltip-side="bottom"
        >
          <IconoMenu aria-hidden="true" />
        </button>

        <nav className="breadcrumb" aria-label="Ruta de navegación">
          <span>Inicio</span>
          <span className="breadcrumb__sep" aria-hidden="true">
            /
          </span>
          <span className="breadcrumb__current">{pageName}</span>
        </nav>
      </div>

      <div className="topbar__right">
        <span className="topbar__date">{today}</span>

        <ThemeToggle />

        <div className="topbar__user">
          <button
            type="button"
            className="topbar__avatar-btn"
            onClick={() => setPickerOpen(true)}
            aria-label="Cambiar foto de perfil"
            data-tooltip="Cambiar foto de perfil"
            data-tooltip-side="bottom"
          >
            <Avatar avatar={usuario?.avatar} nombre={usuario?.nombre ?? ''} />
          </button>
          <span className="topbar__user-info">
            <strong>{usuario?.nombre ?? 'Sesión activa'}</strong>
            <span>{esAdmin ? 'Administrador' : 'Estudiante'}</span>
          </span>
        </div>
      </div>

      <AvatarPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </header>
  )
}
