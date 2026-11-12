import { NIVELES } from '../../utils/format.js'

const COLORS = {
  pregrado: 'blue',
  posgrado: 'teal',
  otros: 'gold',
}

export default function LevelChart({ programas }) {
  const total = programas.length
  const counts = NIVELES.reduce((accumulator, nivel) => {
    accumulator[nivel.value] = programas.filter((programa) => programa.nivel === nivel.value).length
    return accumulator
  }, {})

  return (
    <div className="level-list">
      {NIVELES.map((nivel) => {
        const count = counts[nivel.value] ?? 0
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0

        return (
          <div className="level-row" key={nivel.value}>
            <div className="level-row__top">
              <span className="level-row__name">
                <span
                  className="level-dot"
                  style={{
                    background:
                      nivel.value === 'pregrado'
                        ? '#9b2f5c'
                        : nivel.value === 'posgrado'
                          ? '#a4771f'
                          : '#c9942f',
                  }}
                  aria-hidden="true"
                />
                {nivel.label}
              </span>
              <span className="level-row__value">
                {count} {total > 0 ? `· ${percentage}%` : ''}
              </span>
            </div>
            <div className="level-bar" role="img" aria-label={`${count} programas de ${nivel.label}`}>
              <div
                className={`level-bar__fill level-bar__fill--${COLORS[nivel.value]}`}
                style={{ '--value': `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}

      {total === 0 ? <p className="level-empty">Todavía no hay programas registrados.</p> : null}
    </div>
  )
}
