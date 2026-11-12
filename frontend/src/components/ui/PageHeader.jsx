export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      <div className="page-header__main">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-subtitle">{description}</p> : null}
      </div>

      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  )
}
