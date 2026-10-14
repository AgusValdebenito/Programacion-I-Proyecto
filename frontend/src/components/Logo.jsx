import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Logo() {
  const [imgError, setImgError] = useState(false)

  if (!imgError) {
    return (
      <Link className="fr-logo d-flex align-items-center" to="/" aria-label="FoodRush">
        <img
          className="fr-logo-img"
          src="/images/foodrush-logo.png"
          alt="FoodRush"
          onError={() => setImgError(true)}
        />
      </Link>
    )
  }

  return (
    <Link className="fr-logo text-decoration-none d-flex align-items-center gap-2" to="/">
      <i className="bi bi-bag-fill" />
      <span>
        Food<span className="text-rush">Rush</span>
      </span>
    </Link>
  )
}
