import { Link } from 'react-router-dom'

export default function SectionHeader({ title, to = '/tiendas' }) {
  return (
    <div className="d-flex align-items-center justify-content-between mb-4">
      <h2 className="fr-section-title h4 mb-0">{title}</h2>
      <Link to={to} className="fr-see-all">
        Ver todas <i className="bi bi-chevron-right" />
      </Link>
    </div>
  )
}
