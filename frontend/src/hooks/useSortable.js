import { useCallback, useMemo, useState } from 'react'

export default function useSortable(items, getValue, initialKey = null) {
  const [sort, setSort] = useState({ key: initialKey, direction: 'asc' })

  const toggleSort = useCallback((key) => {
    setSort((actual) =>
      actual.key === key
        ? { key, direction: actual.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    )
  }, [])

  const sorted = useMemo(() => {
    if (!sort.key) return items

    return [...items].sort((a, b) => {
      const va = getValue(a, sort.key)
      const vb = getValue(b, sort.key)

      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1

      const comparacion =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), 'es', { numeric: true, sensitivity: 'base' })

      return sort.direction === 'asc' ? comparacion : -comparacion
    })
  }, [getValue, items, sort])

  return { sorted, sort, toggleSort }
}
