import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Logo({ variant }) {
  const [imgError, setImgError] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  const isPureVendor =
    user?.role === 'vendedor' &&
    !(user?.role === 'admin' || Boolean(user?.is_staff) || Boolean(user?.is_superuser))

  const isStore =
    variant === 'stores' ||
    isPureVendor ||
    location.pathname.startsWith('/panel-tienda')

  const to = isStore ? '/panel-tienda' : '/'
  const label = isStore ? 'FoodRush Stores' : 'FoodRush'

  if (!imgError) {
    return (
      <Link
        className="fr-logo d-flex align-items-center gap-2 text-decoration-none"
        to={to}
        aria-label={label}
      >
        <img
          className="fr-logo-img"
          src="/images/foodrush-logo.png"
          alt={label}
          onError={() => setImgError(true)}
        />
        {isStore && (
          <span
            className="badge bg-primary text-white fw-bold px-2 py-1 rounded-pill shadow-sm"
            style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}
          >
            Stores
          </span>
        )}
      </Link>
    )
  }

  return (
    <Link
      className="fr-logo text-decoration-none d-flex align-items-center gap-2"
      to={to}
      aria-label={label}
    >
      <i className={isStore ? 'bi bi-shop text-primary' : 'bi bi-bag-fill'} />
      <span>
        Food<span className="text-rush">Rush</span>
        {isStore && <span className="text-primary fw-bold ms-1">Stores</span>}
      </span>
    </Link>
  )
}
