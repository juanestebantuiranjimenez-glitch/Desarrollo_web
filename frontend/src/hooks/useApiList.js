import { useCallback, useEffect, useRef, useState } from 'react'

export function useApiList(loader) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const cargar = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!silencioso) setLoading(true)
      setError(null)

      try {
        const response = await loader()
        if (mounted.current) setItems(response?.data ?? [])
      } catch (err) {
        if (mounted.current && err.name !== 'AbortError') setError(err)
      } finally {
        if (mounted.current) setLoading(false)
      }
    },
    [loader],
  )

  useEffect(() => {
    cargar()
  }, [cargar])

  return {
    items,
    setItems,
    loading,
    error,
    recargar: () => cargar({ silencioso: true }),
    cargar,
  }
}
