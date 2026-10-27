import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BottomNav from './components/BottomNav.jsx'
import Home from './views/Home.jsx'
import Login from './views/Login.jsx'
import Register from './views/Register.jsx'
import StoreDetail from './views/StoreDetail.jsx'
import ProductDetail from './views/ProductDetail.jsx'
import Stores from './views/Stores.jsx'
import Cart from './views/Cart.jsx'
import Checkout from './views/Checkout.jsx'
import Profile from './views/Profile.jsx'
import PanelTienda from './views/PanelTienda.jsx'
import ModerationPanel from './views/ModerationPanel.jsx'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <>
      <Navbar />
      <main className="footer-spacer">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/tiendas" element={<Stores />} />
          <Route path="/explorar" element={<Stores />} />
          <Route path="/tiendas/:id" element={<StoreDetail />} />
          <Route path="/productos/:id" element={<ProductDetail />} />
          <Route path="/carrito" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/pedidos" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/favoritos" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/panel-tienda" element={<ProtectedRoute allowedRoles={['vendedor', 'admin']}><PanelTienda /></ProtectedRoute>} />
          <Route path="/admin/moderacion" element={<ProtectedRoute allowedRoles={['admin']}><ModerationPanel /></ProtectedRoute>} />
        </Routes>
      </main>

      <Footer />
      <BottomNav />
    </>
  )
}

export default App
