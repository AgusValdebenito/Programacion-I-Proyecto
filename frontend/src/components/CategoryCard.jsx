export default function CategoryCard({ category }) {
  return (
    <div className="fr-card d-flex flex-column h-100">
      <div className={`fr-card-img ${category.gradient}`}>
        <span role="img" aria-label={category.title}>
          {category.emoji}
        </span>
      </div>
      <div className="p-3 d-flex align-items-center justify-content-between gap-2">
        <div>
          <h3 className="fr-card-title">{category.title}</h3>
          <p className="fr-card-sub">{category.subtitle}</p>
        </div>
        <button type="button" className="fr-card-btn" aria-label={`Ver ${category.title}`}>
          <i className="bi bi-arrow-right" />
        </button>
      </div>
    </div>
  )
}