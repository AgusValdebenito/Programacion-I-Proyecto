export default function StoreLogo({ store }) {
  return (
    <div className="text-center">
      <div className={`fr-store-logo mx-auto ${store.gradient}`}>{store.initials}</div>
      <p className="fw-semibold mb-0 mt-3 small">{store.name}</p>
      <p className="text-secondary small mb-0">{store.tagline}</p>
    </div>
  )
}