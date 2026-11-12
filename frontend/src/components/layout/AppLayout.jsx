import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button
        type="button"
        className={`sidebar-overlay ${sidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-label="Cerrar menú"
        tabIndex={sidebarOpen ? 0 : -1}
      />

      <div className="app-main">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
