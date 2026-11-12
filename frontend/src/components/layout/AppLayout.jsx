import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import SoftAurora from '../reactbits/SoftAurora.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

const SIDEBAR_KEY = 'admitidos.sidebar'

function leerSidebarGuardado() {
  try {
    return window.localStorage.getItem(SIDEBAR_KEY) === 'collapsed'
  } catch {
    return false
  }
}

export default function AppLayout() {
  const { isDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(leerSidebarGuardado)
  const [esMovil, setEsMovil] = useState(
    () => window.matchMedia?.('(max-width: 900px)').matches ?? false,
  )
  const shellRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)')
    const aplicar = () => {
      setEsMovil(query.matches)
      if (!query.matches) setSidebarOpen(false)
    }

    aplicar()
    query.addEventListener('change', aplicar)
    return () => query.removeEventListener('change', aplicar)
  }, [])

  useEffect(() => {
    if (!esMovil || !sidebarOpen) {
      document.body.style.overflow = ''
      return undefined
    }

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [esMovil, sidebarOpen])

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_KEY, collapsed ? 'collapsed' : 'expanded')
    } catch {
      // Si el navegador bloquea localStorage, la preferencia dura la sesión actual.
    }
  }, [collapsed])

  // Resplandor que sigue al puntero sobre el fondo del panel.
  useEffect(() => {
    const shell = shellRef.current
    if (!shell) return undefined

    let frame = 0

    const mover = (event) => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        shell.style.setProperty('--pointer-x', `${event.clientX}px`)
        shell.style.setProperty('--pointer-y', `${event.clientY}px`)
        frame = 0
      })
    }

    window.addEventListener('pointermove', mover, { passive: true })
    return () => {
      window.removeEventListener('pointermove', mover)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const alternarSidebar = useCallback(() => {
    if (esMovil) {
      setSidebarOpen((actual) => !actual)
      return
    }

    setCollapsed((actual) => !actual)
  }, [esMovil])

  const colapsado = !esMovil && collapsed

  return (
    <div
      ref={shellRef}
      className={`app-shell ${colapsado ? 'is-collapsed' : ''}`}
    >
      <div className="app-ambient" aria-hidden="true">
        <SoftAurora
          speed={0.18}
          scale={1.8}
          brightness={0.95}
          color1={isDark ? '#1b0815' : '#fdf8f0'}
          color2={isDark ? '#7d2449' : '#e6a8c4'}
          lightMode={!isDark}
          noiseFrequency={2.2}
          noiseAmplitude={0.8}
          bandHeight={0.7}
          bandSpread={1.2}
          colorSpeed={0.5}
          spectrum={0.24}
          opacity={0.55}
          enableMouseInteraction
          mouseInfluence={0.08}
          clickPulse={false}
        />
        <span className="app-ambient__orb app-ambient__orb--one" />
        <span className="app-ambient__orb app-ambient__orb--two" />
        <span className="app-ambient__orb app-ambient__orb--three" />
      </div>

      <Sidebar
        open={sidebarOpen}
        collapsed={colapsado}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={alternarSidebar}
      />

      <button
        type="button"
        className={`sidebar-overlay ${sidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-label="Cerrar menú"
        tabIndex={sidebarOpen ? 0 : -1}
      />

      <div className="app-main">
        <Topbar
          onMenu={alternarSidebar}
          mobile={esMovil}
          sidebarCollapsed={collapsed}
          menuExpanded={esMovil ? sidebarOpen : !collapsed}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
