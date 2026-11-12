export default function Badge({ tone = 'slate', children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}
