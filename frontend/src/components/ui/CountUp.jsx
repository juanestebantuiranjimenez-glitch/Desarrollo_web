import { useEffect, useRef, useState } from 'react'

const formatter = new Intl.NumberFormat('es-CO')

export default function CountUp({ value, duration = 900, prefix = '', suffix = '' }) {
  const target = Number(value)
  const valido = Number.isFinite(target)
  const previo = useRef(0)
  const [actual, setActual] = useState(valido ? 0 : value)

  useEffect(() => {
    if (!valido) {
      setActual(value)
      return undefined
    }

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce) {
      previo.current = target
      setActual(target)
      return undefined
    }

    const desde = previo.current
    const inicio = performance.now()
    let frame = 0

    const tick = (ahora) => {
      const progreso = Math.min(1, (ahora - inicio) / duration)
      const suave = 1 - (1 - progreso) ** 3

      setActual(desde + (target - desde) * suave)

      if (progreso < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        previo.current = target
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [duration, target, valido, value])

  if (!valido) return <>{value}</>

  return (
    <>
      {prefix}
      {formatter.format(Math.round(actual))}
      {suffix}
    </>
  )
}
