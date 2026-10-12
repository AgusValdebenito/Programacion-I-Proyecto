import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BottomNav from './components/BottomNav.jsx'
import Home from './views/Home.jsx'
import Login from './views/Login.jsx'
import Register from './views/Register.jsx'
import StoreDetail from './views/StoreDetail.jsx'
import Cart from './views/Cart.jsx'
import Checkout from './views/Checkout.jsx'
import Profile from './views/Profile.jsx'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <>
      <Navbar />
      <main className="footer-spacer">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/tiendas/:id" element={<ProtectedRoute><StoreDetail /></ProtectedRoute>} />
          <Route path="/carrito" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/pedidos" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}

export default App
