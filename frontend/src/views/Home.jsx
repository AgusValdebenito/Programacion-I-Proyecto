import { useEffect, useState } from 'react'
import Hero from '../components/Hero.jsx'
import CategoryCard from '../components/CategoryCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import StoreLogo from '../components/StoreLogo.jsx'
import { categories, stores } from '../data/homeData.js'
import { useAuth } from '../hooks/useAuth'

const API_URL = import.meta.env.VITE_API_URL

export default function Home() {
  const { user, setUser, getValidToken } = useAuth()
  const [profile, setProfile] = useState(user)

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      const token = await getValidToken()
      if (!token) return

      try {
        const response = await fetch(`${API_URL}/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok && isMounted) {
          const data = await response.json()
          setProfile(data)
          setUser((prev) => ({ ...prev, ...data }))
          localStorage.setItem('user', JSON.stringify(data))
        }
      } catch (err) {
        // En caso de fallo de red, mantener los datos cacheados
        console.warn('No se pudo actualizar el perfil desde el backend, usando datos locales:', err)
      }
    }

    fetchProfile()

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

        <div className="d-flex overflow-auto gap-4 pb-2 d-md-none">
          {stores.map((store) => (
            <StoreLogo key={store.name} store={store} />
          ))}
        </div>

        <div className="row g-4 d-none d-md-flex">
          {stores.map((store) => (
            <div className="col" key={store.name}>
              <StoreLogo store={store} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
