import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!name || !email || !password) {
      setError('Por favor completa los campos obligatorios')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setIsSubmitting(true)
    const result = await register(name, email, password, username || undefined)
    setIsSubmitting(false)

    if (result.success) {
      setSuccessMsg('¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } else {
      setError(result.error || 'Error al registrar la cuenta')
    }
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="card shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-4">
          <h2 className="card-title text-center mb-4">Crear Cuenta</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success" role="alert">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Nombre completo</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="username" className="form-label">Nombre de usuario (opcional)</label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario123"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                minLength={8}
                required
              />
              <div className="form-text">Mínimo 8 caracteres.</div>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <p className="text-center mt-3 mb-0">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
