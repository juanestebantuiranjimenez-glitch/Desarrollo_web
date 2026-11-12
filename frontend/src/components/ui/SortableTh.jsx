import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'

export default function SortableTh({ label, sortKey, sort, onSort, className = '' }) {
  const activo = sort.key === sortKey
  const Icono = activo ? (sort.direction === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown

  return (
    <th
      className={className}
      aria-sort={activo ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        className={`th-sort ${activo ? 'is-active' : ''}`}
        onClick={() => onSort(sortKey)}
      >
        <span>{label}</span>
        <Icono aria-hidden="true" />
      </button>
    </th>
  )
}
