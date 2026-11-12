import { Moon, Sun } from 'lucide-react'

import { useTheme } from '../../context/ThemeContext.jsx'

export default function ThemeToggle({ floating = false }) {
  const { isDark, toggle } = useTheme()
  const label = isDark ? 'Activar tema claro' : 'Activar tema oscuro'

  return (
    <button
      type="button"
      className={`theme-toggle ${floating ? 'theme-toggle--floating' : ''}`}
      onClick={toggle}
      aria-label={label}
      data-tooltip={label}
      data-tooltip-side="bottom"
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  )
}
