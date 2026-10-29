import { useEffect, useState } from 'react'
import Hero from '../components/Hero.jsx'
import CategoryCard from '../components/CategoryCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import StoreLogo from '../components/StoreLogo.jsx'
import { categories } from '../data/homeData.js'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/authService'
import { storeService } from '../services/storeService'
import { setStoredTokens } from '../utils/token'

export default function Home() {
  const { user, setUser, getValidToken } = useAuth()
  const [profile, setProfile] = useState(user)
  const [stores, setStores] = useState([])
  const [featuredStores, setFeaturedStores] = useState([])
  const [loadingStores, setLoadingStores] = useState(true)
  const [storesError, setStoresError] = useState(null)

  const handleRetryStores = async () => {
    setLoadingStores(true)
    setStoresError(null)
    try {
      const res = await storeService.getStores()
      if (res && res.success) {
        const list = res.data || []
        setStores(list)
        const shuffled = [...list].sort(() => 0.5 - Math.random())
        setFeaturedStores(shuffled.slice(0, 6))
        setStoresError(null)
      } else {
        setStoresError(res?.error || 'Error al obtener las tiendas disponibles')
      }
    } catch {
      setStoresError('Error de conexión con el servidor')
    } finally {
      setLoadingStores(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      const token = await getValidToken()
      if (!token) return

      try {
        const data = await authService.getProfile(token)
        if (data && isMounted) {
          setProfile(data)
          setUser((prev) => ({ ...prev, ...data }))
          setStoredTokens({ user: data })
        }
      } catch (err) {
        // En caso de fallo de red, mantener los datos cacheados
        console.warn('No se pudo actualizar el perfil desde el backend, usando datos locales:', err)
      }
    }

    const loadStores = async () => {
      try {
        const res = await storeService.getStores()
        if (!isMounted) return
        if (res && res.success) {
          const list = res.data || []
          setStores(list)
          const shuffled = [...list].sort(() => 0.5 - Math.random())
          setFeaturedStores(shuffled.slice(0, 6))
          setStoresError(null)
        } else {
          setStoresError(res?.error || 'Error al obtener las tiendas disponibles')
        }
      } catch {
        if (isMounted) {
          setStoresError('Error de conexión con el servidor')
        }
      } finally {
        if (isMounted) {
          setLoadingStores(false)
        }
      }
    }

    fetchProfile()
    loadStores()

    return () => {
      isMounted = false
    }
  }, [getValidToken, setUser])

  const mainCategories = categories.filter((category) => category.featured)
  const secondaryCategories = categories.filter((category) => !category.featured)

  const displayName = profile?.name || profile?.username || user?.name || user?.username || ''

  return (
    <>
      <Hero userName={displayName} />

      <section id="categorias" className="container py-3">
        <h2 className="h5 fw-bold mb-4">¿Qué pedimos hoy?</h2>
        <div className="row g-3 g-md-4">
          {mainCategories.map((category) => (
            <div className="col-12 col-sm-6 col-md-4" key={category.id}>
              <CategoryCard category={category} />
            </div>
          ))}
          {secondaryCategories.map((category) => (
            <div className="col-6 col-md-4" key={category.id}>
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </section>

      <section id="tiendas" className="container pt-5 pb-4 mb-5">
        <SectionHeader title="Tiendas destacadas" />

        {loadingStores ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary me-2" role="status">
              <span className="visually-hidden">Cargando tiendas...</span>
            </div>
            <span className="text-secondary fw-semibold">Cargando tiendas...</span>
          </div>
        ) : storesError ? (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-3" role="alert">
            <div>
              <i className="bi bi-exclamation-triangle-fill me-2" />
              <span>{storesError}</span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleRetryStores}
            >
              Reintentar
            </button>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-5 bg-light rounded-3 border">
            <i className="bi bi-shop text-muted fs-1 mb-2 d-block" />
            <p className="text-secondary fw-medium mb-0">No hay tiendas disponibles en este momento.</p>
          </div>
        ) : (
          <>
            <div className="d-flex overflow-auto gap-4 pb-2 d-md-none">
              {featuredStores.map((store) => (
                <StoreLogo key={store.id || store.name} store={store} />
              ))}
            </div>

            <div className="row g-4 d-none d-md-flex row-cols-2 row-cols-sm-3 row-cols-md-6 justify-content-center">
              {featuredStores.map((store) => (
                <div className="col" key={store.id || store.name}>
                  <StoreLogo store={store} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  )
}
