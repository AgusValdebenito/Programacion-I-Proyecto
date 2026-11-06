export default function Hero({ userName }) {
  return (
    <div className="container py-2 py-md-3" id="inicio">
      <div className="fr-hero p-3 p-md-4">
        <div className="row align-items-center g-3">
          <div className="col-12 col-sm-8 col-md-7 text-center text-sm-start">
            <span className="fr-promo-badge">
              {userName ? `¡Hola, ${userName}! Exclusivo FoodRush` : 'Exclusivo FoodRush'}
            </span>
            <h1 className="mt-2 mb-2">
              Nuestras mejores
              <br className="d-none d-sm-inline" /> promociones
            </h1>
            <p className="fr-discount mb-0">50% OFF</p>
            <a
              href="#categorias"
              className="btn btn-warning btn-sm fw-semibold rounded-pill px-3 py-1 mt-2 mt-md-3 d-inline-flex align-items-center"
            >
              Explorar promociones <i className="bi bi-arrow-right ms-2" />
            </a>
          </div>
          <div className="col-12 col-sm-4 col-md-5 d-flex justify-content-center">
            <div className="fr-hero-img" role="img" aria-label="Promo de hamburguesa con papas y bebida">
              <span>🍔</span>
              <span>🍟</span>
              <span>🥤</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
