import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAddress } from '../hooks/useAddress'
import { authService } from '../services/authService'
import { setStoredTokens } from '../utils/token'

export default function ProfileInfo() {
  const { user, setUser, getValidToken } = useAuth()
  const { addresses, activeAddress, selectAddress, addAddress, deleteAddress } = useAddress()

  // Formulario de datos personales
  const [name, setName] = useState(user?.name || user?.username || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(null)
  const [profileError, setProfileError] = useState(null)

  // Formulario para nueva dirección
  const [newLabel, setNewLabel] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [addressError, setAddressError] = useState(null)

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileSuccess(null)
    setProfileError(null)
    setSavingProfile(true)

    try {
      const token = await getValidToken()
      if (!token) {
        setProfileError('Sesión no válida o expirada.')
        return
      }

      const res = await authService.updateProfile({ name, phone }, token)
      if (res.success && res.data) {
        setUser((prev) => ({ ...prev, ...res.data }))
        setStoredTokens({ user: res.data })
        setProfileSuccess('¡Perfil actualizado con éxito!')
        setTimeout(() => setProfileSuccess(null), 3000)
      } else {
        setProfileError(res.error || 'No se pudo actualizar el perfil.')
      }
    } catch {
      setProfileError('Error de conexión al guardar cambios.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAddAddress = (e) => {
    e.preventDefault()
    setAddressError(null)

    if (!newLabel.trim()) {
      setAddressError('Ingresá una etiqueta (ej. Casa, Hotel, Trabajo).')
      return
    }
    if (!newAddress.trim()) {
      setAddressError('Ingresá la dirección completa.')
      return
    }

    addAddress({ label: newLabel, address: newAddress })
    setNewLabel('')
    setNewAddress('')
  }

  return (
    <div className="row g-4">
      {/* Columna 1: Datos Personales */}
      <div className="col-12 col-lg-6">
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
          <h2 className="h5 fw-bold text-dark mb-3">
            <i className="bi bi-person-fill text-primary me-2" />
            Datos Personales
          </h2>

          {profileSuccess && (
            <div className="alert alert-success py-2 px-3 rounded-3 small d-flex align-items-center mb-3" role="status">
              <i className="bi bi-check-circle-fill me-2" />
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className="alert alert-danger py-2 px-3 rounded-3 small d-flex align-items-center mb-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2" />
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="mb-3">
              <label htmlFor="profile-name" className="form-label small fw-semibold text-secondary">
                Nombre completo *
              </label>
              <input
                type="text"
                id="profile-name"
                className="form-control rounded-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Juan Perez"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="profile-email" className="form-label small fw-semibold text-secondary">
                Correo electrónico
              </label>
              <input
                type="email"
                id="profile-email"
                className="form-control rounded-3 bg-light text-muted"
                value={user?.email || ''}
                disabled
              />
              <small className="text-muted d-block mt-1">El email identifica tu cuenta y no puede modificarse.</small>
            </div>

            <div className="mb-3">
              <label htmlFor="profile-phone" className="form-label small fw-semibold text-secondary">
                Teléfono de contacto
              </label>
              <input
                type="tel"
                id="profile-phone"
                className="form-control rounded-3"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 11 4455-6677"
              />
              <small className="text-muted d-block mt-1">Se autocompletará en tus pedidos para facilitar la entrega.</small>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 rounded-pill fw-semibold shadow-sm"
                disabled={savingProfile}
              >
                {savingProfile ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Columna 2: Direcciones Guardadas */}
      <div className="col-12 col-lg-6">
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="h5 fw-bold text-dark mb-0">
              <i className="bi bi-geo-alt-fill text-danger me-2" />
              Direcciones Guardadas
            </h2>
            <span className="badge bg-light text-secondary border rounded-pill">
              {addresses.length} {addresses.length === 1 ? 'guardada' : 'guardadas'}
            </span>
          </div>

          <p className="text-muted small mb-3">
            Seleccioná tu dirección activa para que se complete automáticamente al hacer tu pedido.
          </p>

          {/* Listado de direcciones */}
          <div className="d-flex flex-column gap-2 mb-4">
            {addresses.map((item) => {
              const isActive = activeAddress?.id === item.id
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-3 border d-flex align-items-center justify-content-between transition-hover ${
                    isActive ? 'border-primary bg-light' : 'bg-white'
                  }`}
                >
                  <div className="flex-grow-1 min-w-0 me-2">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-secondary-subtle text-dark border fw-bold">{item.label}</span>
                      {isActive && <span className="badge bg-success small">Activa</span>}
                    </div>
                    <p className="mb-0 text-secondary small text-truncate">{item.address}</p>
                  </div>

                  <div className="d-flex align-items-center gap-1 flex-shrink-0">
                    {!isActive && (
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm rounded-pill px-2"
                        onClick={() => selectAddress(item.id)}
                        title="Seleccionar para envíos"
                      >
                        Usar
                      </button>
                    )}
                    {addresses.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-link text-danger p-1"
                        onClick={() => deleteAddress(item.id)}
                        title="Eliminar dirección"
                        aria-label={`Eliminar dirección ${item.label}`}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Formulario para agregar nueva dirección */}
          <div className="pt-3 border-top">
            <h3 className="h6 fw-bold text-dark mb-2">Agregar nueva dirección</h3>

            {addressError && (
              <div className="alert alert-danger py-1 px-2 small rounded-3 mb-2" role="alert">
                {addressError}
              </div>
            )}

            <form onSubmit={handleAddAddress} className="d-flex flex-column gap-2">
              <div className="row g-2">
                <div className="col-12 col-sm-5">
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-3"
                    placeholder="Ej: Hotel, Trabajo, Casa de mi amigo"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                </div>
                <div className="col-12 col-sm-7">
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-3"
                    placeholder="Ej: Av. Rivadavia 4500"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button type="submit" className="btn btn-outline-success btn-sm rounded-pill px-3 mt-1">
                  <i className="bi bi-plus-lg me-1" />
                  Agregar dirección
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
