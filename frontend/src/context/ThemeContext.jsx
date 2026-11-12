import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'admitidos.theme'

function leerTemaInicial() {
  try {
    const guardado = window.localStorage.getItem(STORAGE_KEY)
    if (guardado === 'light' || guardado === 'dark') return guardado
  } catch {
    // Si localStorage no está disponible se usa el tema oscuro por defecto.
  }

  return 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(leerTemaInicial)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // La preferencia dura solo la sesión actual si el navegador la bloquea.
    }

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#140710' : '#f7f0e6')
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((actual) => (actual === 'dark' ? 'light' : 'dark'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const contexto = useContext(ThemeContext)
  if (!contexto) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return contexto
}
