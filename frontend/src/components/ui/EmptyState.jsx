export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon ? (
        <span className="empty-state__icon" aria-hidden="true">
          <Icon />
        </span>
      ) : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  )
}
