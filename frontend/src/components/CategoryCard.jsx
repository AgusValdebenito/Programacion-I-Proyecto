import { Link } from 'react-router-dom'

export default function CategoryCard({ category }) {
  const targetUrl = `/tiendas?categoria=${category.id}`

  return (
    <Link
      to={targetUrl}
      className="text-decoration-none text-reset d-block h-100"
      aria-label={`Ver ${category.title}`}
    >
      <div className="fr-card d-flex flex-column h-100 transition-hover">
        <div className={`fr-card-img ${category.gradient}`}>
          {category.image ? (
            <img className="fr-card-img-img" src={category.image} alt={category.title} />
          ) : (
            <span role="img" aria-label={category.title}>
              {category.emoji}
            </span>
          )}
        </div>
        <div className="p-3 d-flex align-items-center justify-content-between gap-2">
          <div>
            <h3 className="fr-card-title">{category.title}</h3>
            <p className="fr-card-sub">{category.subtitle}</p>
          </div>
          <span className="fr-card-btn" aria-hidden="true">
            <i className="bi bi-arrow-right" />
          </span>
        </div>
      </div>
    </Link>
  )
}

