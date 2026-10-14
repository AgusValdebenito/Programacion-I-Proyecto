import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Componente de orden superior para proteger rutas según autenticación y roles de usuario (TP7 & TP9).
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} [props.allowedRoles] - Roles permitidos para acceder (ej. ['admin', 'vendedor'])
 * @param {string} [props.redirectTo] - Ruta de redirección alternativa para rol no autorizado (default: '/')
 */
export function ProtectedRoute({ children, allowedRoles, redirectTo = '/' }) {
  const { user, loading, getToken, isTokenExpired } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  const token = getToken()

  if (!user || !token || isTokenExpired(token)) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}