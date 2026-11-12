import { NavLink } from 'react-router-dom'
import {
  Building2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react'

import logoMark from '../../assets/logo-m.png'
import { useAuth } from '../../context/AuthContext.jsx'
import Avatar from '../ui/Avatar.jsx'

const NAV_ADMIN = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/facultades', label: 'Facultades', icon: Building2 },
  { to: '/programas', label: 'Programas', icon: GraduationCap },
  { to: '/estudiantes', label: 'Estudiantes', icon: Users },
  { to: '/administradores', label: 'Administradores', icon: ShieldCheck },
]

const NAV_ESTUDIANTE = [{ to: '/mi-panel', label: 'Mi panel', icon: GraduationCap }]

export default function Sidebar({ open, onClose }) {
  const { usuario, esAdmin, cerrarSesion } = useAuth()
  const items = esAdmin ? NAV_ADMIN : NAV_ESTUDIANTE
  const grupo = esAdmin ? 'Administración' : 'Mi espacio'

  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Navegación principal">
      <div className="sidebar__brand">
        <div className="brand-mark">
          <img className="brand-mark__img" src={logoMark} alt="Monsters University" />
        </div>
        <div className="brand-text">
          <strong>Monsters</strong>
          <span>University · Admisiones</span>
        </div>
        <button
          type="button"
          className="icon-btn icon-btn--sidebar sidebar__close"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <X />
        </button>
      </div>

      <nav className="sidebar__nav">
        <div className="nav-group">
          <span className="nav-group__label">{grupo}</span>
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar-user">
          <Avatar
            avatar={usuario?.avatar}
            nombre={usuario?.nombre ?? ''}
            className="sidebar-user__avatar"
          />
          <div className="sidebar-user__info">
            <strong title={usuario?.nombre}>{usuario?.nombre ?? 'Sesión activa'}</strong>
            <span>
              {esAdmin ? (
                <>
                  <ShieldCheck size={11} aria-hidden="true" />
                  Administrador
                </>
              ) : (
                <>
                  <UserRound size={11} aria-hidden="true" />
                  Estudiante
                </>
              )}
            </span>
          </div>
        </div>

        <button type="button" className="sidebar-logout" onClick={cerrarSesion}>
          <LogOut aria-hidden="true" />
          Cerrar sesión
        </button>

        <div className="sidebar-card">
          <div className="sidebar-card__label">Periodo académico</div>
          <div className="sidebar-card__value">2026 - 2</div>
          <div className="sidebar-card__hint">
            {esAdmin ? 'Facultades, programas y estudiantes' : 'Tu programa y tu facultad'}
          </div>
        </div>

        <p className="sidebar__copyright">Monsters University</p>
      </div>
    </aside>
  )
}
