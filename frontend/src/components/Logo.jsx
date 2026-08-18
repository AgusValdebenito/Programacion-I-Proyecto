import { useState } from 'react'

export default function Logo() {
  const [imgError, setImgError] = useState(false)

  if (!imgError) {
    return (
      <a className="fr-logo d-flex align-items-center" href="#" aria-label="FoodRush">
        <img
          className="fr-logo-img"
          src="/images/foodrush-logo.png"
          alt="FoodRush"
          onError={() => setImgError(true)}
        />
      </a>
    )
  }

  return (
    <a className="fr-logo text-decoration-none d-flex align-items-center gap-2" href="#">
      <i className="bi bi-bag-fill" />
      <span>
        Food<span className="text-rush">Rush</span>
      </span>
    </a>
  )
}