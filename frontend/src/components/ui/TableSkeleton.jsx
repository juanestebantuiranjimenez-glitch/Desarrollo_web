const ANCHOS = ['72%', '58%', '84%', '46%', '66%']

export default function TableSkeleton({ labels = [], rows = 6 }) {
  const columnas = labels.length || 4

  return (
    <div className="table-wrap table-skeleton" role="status" aria-label="Cargando datos">
      <table className="data-table" aria-hidden="true">
        <thead>
          <tr>
            {Array.from({ length: columnas }).map((_, columna) => (
              <th key={columna}>{labels[columna] || ' '}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, fila) => (
            <tr key={fila}>
              {Array.from({ length: columnas }).map((_, columna) => (
                <td key={columna}>
                  <span
                    className="skeleton skeleton--cell"
                    style={{ width: ANCHOS[(fila + columna) % ANCHOS.length] }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
