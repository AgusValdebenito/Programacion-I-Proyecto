import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BottomNav from './components/BottomNav.jsx'
import Home from './views/Home.jsx'

function App() {
  return (
    <>
      <Navbar />
      <main className="footer-spacer">
        <Home />
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}

export default App
