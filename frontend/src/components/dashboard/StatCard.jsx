import SpotlightCard from '../reactbits/SpotlightCard.jsx'

const SPOTLIGHT_COLORS = {
  blue: 'rgba(155, 47, 92, 0.2)',
  teal: 'rgba(164, 119, 31, 0.2)',
  gold: 'rgba(201, 148, 47, 0.2)',
  navy: 'rgba(59, 21, 51, 0.16)',
}

export default function StatCard({ icon: Icon, tone = 'blue', label, value, hint, trend }) {
  return (
    <SpotlightCard
      theme="light"
      className="stat-card"
      spotlightColor={SPOTLIGHT_COLORS[tone]}
      spotlightSize={230}
      intensity={0.16}
      borderGlow={0.5}
      flare={false}
    >
      <div className="stat-card__top">
        <span className={`stat-card__icon stat-card__icon--${tone}`} aria-hidden="true">
          <Icon />
        </span>
        {trend ? <span className="stat-card__trend">{trend}</span> : null}
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      {hint ? <div className="stat-card__hint">{hint}</div> : null}
    </SpotlightCard>
  )
}
