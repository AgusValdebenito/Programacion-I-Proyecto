import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Componente de orden superior para proteger rutas según autenticación y roles de usuario.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} [props.allowedRoles] - Roles permitidos para acceder (ej. ['admin', 'vendedor'])
 * @param {string[]} [props.disallowedRoles] - Roles explícitamente no permitidos (ej. ['vendedor'])
 * @param {string} [props.redirectTo] - Ruta de redirección alternativa para rol no autorizado (default: '/')
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  disallowedRoles,
  redirectTo = '/',
}) {
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

  const isAdmin = user.role === 'admin' || Boolean(user.is_staff) || Boolean(user.is_superuser)

  if (disallowedRoles && disallowedRoles.includes(user.role) && !isAdmin) {
    return <Navigate to={redirectTo || '/panel-tienda'} replace />
  }

  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}

/**
 * Componente para rutas de clientes / catálogo público.
 * Redirige automáticamente a /panel-tienda si el usuario conectado es un vendedor puro (no admin).
 * Los usuarios anónimos, clientes y administradores acceden con normalidad.
 */
export function ClientRoute({ children, redirectTo = '/panel-tienda' }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  const isPureVendor =
    user?.role === 'vendedor' &&
    !(user?.role === 'admin' || Boolean(user?.is_staff) || Boolean(user?.is_superuser))

  if (isPureVendor) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
