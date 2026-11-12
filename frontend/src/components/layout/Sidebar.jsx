import { NavLink } from 'react-router-dom'
import {
  Building2,
  ChevronsLeft,
  ChevronsRight,
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
import GradientText from '../reactbits/GradientText.jsx'
import SpotlightCard from '../reactbits/SpotlightCard.jsx'
import Avatar from '../ui/Avatar.jsx'

const NAV_ADMIN = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/facultades', label: 'Facultades', icon: Building2 },
  { to: '/programas', label: 'Programas', icon: GraduationCap },
  { to: '/estudiantes', label: 'Estudiantes', icon: Users },
  { to: '/administradores', label: 'Administradores', icon: ShieldCheck },
]

const NAV_ESTUDIANTE = [{ to: '/mi-panel', label: 'Mi panel', icon: GraduationCap }]

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }) {
  const { usuario, esAdmin, cerrarSesion } = useAuth()
  const items = esAdmin ? NAV_ADMIN : NAV_ESTUDIANTE
  const grupo = esAdmin ? 'Administración' : 'Mi espacio'
  const IconoColapso = collapsed ? ChevronsRight : ChevronsLeft

  return (
    <aside
      id="app-sidebar"
      className={`sidebar ${open ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`}
      aria-label="Navegación principal"
    >
      <div className="sidebar__ambient" aria-hidden="true">
        <span className="sidebar__beam" />
        <span className="sidebar__spark sidebar__spark--one" />
        <span className="sidebar__spark sidebar__spark--two" />
        <span className="sidebar__spark sidebar__spark--three" />
      </div>

      <div className="sidebar__brand">
        <div className="brand-mark">
          <img className="brand-mark__img" src={logoMark} alt="Monsters University" />
        </div>
        <div className="brand-text">
          <strong>
            <GradientText
              colors={['#fbf0d4', '#d9ad55', '#f7e7ee', '#d9ad55']}
              animationSpeed={9}
              variant="flow"
              glow={0.12}
            >
              Monsters
            </GradientText>
          </strong>
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
        <button
          type="button"
          className="icon-btn icon-btn--sidebar sidebar__collapse"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expandir panel lateral' : 'Contraer panel lateral'}
          data-tooltip={collapsed ? 'Expandir panel' : 'Contraer panel'}
          data-tooltip-side="bottom"
        >
          <IconoColapso />
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
              data-tooltip={collapsed ? label : undefined}
              data-tooltip-side="right"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon aria-hidden="true" />
              <span className="nav-link__label">{label}</span>
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

        <button
          type="button"
          className="sidebar-logout"
          onClick={cerrarSesion}
          data-tooltip={collapsed ? 'Cerrar sesión' : undefined}
          data-tooltip-side="right"
        >
          <LogOut aria-hidden="true" />
          <span className="sidebar-logout__label">Cerrar sesión</span>
        </button>

        <SpotlightCard
          theme="dark"
          className="sidebar-card"
          spotlightColor="rgba(217, 173, 85, 0.32)"
          spotlightSize={190}
          intensity={0.16}
          borderGlow={0.5}
          flare={false}
        >
          <div className="sidebar-card__label">Periodo académico</div>
          <div className="sidebar-card__value">2026 - 2</div>
          <div className="sidebar-card__hint">
            {esAdmin ? 'Facultades, programas y estudiantes' : 'Tu programa y tu facultad'}
          </div>
        </SpotlightCard>

        <p className="sidebar__copyright">Monsters University</p>
      </div>
    </aside>
  )
}
