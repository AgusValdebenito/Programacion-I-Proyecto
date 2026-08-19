export default function Hero() {
  return (
    <div className="container py-4" id="inicio">
      <div className="fr-hero p-4 p-md-5">
        <div className="row align-items-center g-0">
          <div className="col-12 col-md-6">
            <span className="fr-promo-badge">Exclusivo FoodRush</span>
            <h1 className="mt-3 mb-3">
              Nuestras mejores
              <br />
              promociones
            </h1>
            <p className="fr-discount mb-0">50% OFF</p>
            <a
              href="#categorias"
              className="btn btn-warning fw-semibold rounded-pill px-4 py-2 mt-4 d-inline-flex align-items-center"
            >
              Explorar promociones <i className="bi bi-arrow-right ms-2" />
            </a>
          </div>
          <div className="col-12 col-md-6 d-flex justify-content-center">
            <div className="fr-hero-img" role="img" aria-label="Promo de hamburguesa con papas y bebida">
              <span>🍔</span>
              <span>🍟</span>
              <span>🥤</span>
            </div>
          </div>
        </div>
        <div className="fr-carousel-dots" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
