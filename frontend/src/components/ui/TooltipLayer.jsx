import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const OFFSET = 10
const DELAY = 120

export default function TooltipLayer() {
  const [tip, setTip] = useState(null)
  const timer = useRef(0)

  useEffect(() => {
    const mostrar = (el) => {
      const label = el.dataset.tooltip
      if (!label) return

      const rect = el.getBoundingClientRect()
      const side = el.dataset.tooltipSide || 'top'

      let x = rect.left + rect.width / 2
      let y = rect.top - OFFSET

      if (side === 'right') {
        x = rect.right + OFFSET
        y = rect.top + rect.height / 2
      } else if (side === 'bottom') {
        x = rect.left + rect.width / 2
        y = rect.bottom + OFFSET
      } else if (side === 'left') {
        x = rect.left - OFFSET
        y = rect.top + rect.height / 2
      }

      setTip({ label, side, x, y })
    }

    const programar = (el) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => mostrar(el), DELAY)
    }

    const ocultar = () => {
      window.clearTimeout(timer.current)
      setTip(null)
    }

    const onPointerOver = (event) => {
      const el = event.target.closest?.('[data-tooltip]')
      if (el) programar(el)
    }

    const onPointerOut = (event) => {
      const el = event.target.closest?.('[data-tooltip]')
      if (!el) return
      if (event.relatedTarget && el.contains(event.relatedTarget)) return
      ocultar()
    }

    const onFocusIn = (event) => {
      const el = event.target.closest?.('[data-tooltip]')
      if (el) mostrar(el)
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') ocultar()
    }

    document.addEventListener('pointerover', onPointerOver)
    document.addEventListener('pointerout', onPointerOut)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', ocultar)
    document.addEventListener('pointerdown', ocultar)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', ocultar, true)
    window.addEventListener('resize', ocultar)

    return () => {
      window.clearTimeout(timer.current)
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointerout', onPointerOut)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', ocultar)
      document.removeEventListener('pointerdown', ocultar)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', ocultar, true)
      window.removeEventListener('resize', ocultar)
    }
  }, [])

  if (!tip) return null

  return createPortal(
    <div
      className={`app-tooltip app-tooltip--${tip.side}`}
      style={{ left: `${tip.x}px`, top: `${tip.y}px` }}
      role="tooltip"
    >
      {tip.label}
    </div>,
    document.body,
  )
}
