import Hero from '../components/Hero.jsx'
import CategoryCard from '../components/CategoryCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import StoreLogo from '../components/StoreLogo.jsx'
import { categories, stores } from '../data/homeData.js'

export default function Home() {
  const mainCategories = categories.filter((category) => category.featured)
  const secondaryCategories = categories.filter((category) => !category.featured)

  return (
    <>
      <Hero />

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
