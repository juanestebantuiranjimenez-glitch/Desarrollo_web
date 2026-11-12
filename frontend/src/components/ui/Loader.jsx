export default function Loader({ text = 'Cargando información…' }) {
  return (
    <div className="loader" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{text}</span>
    </div>
  )
}
