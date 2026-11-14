import { Route, Routes } from 'react-router';
import Navbar from './components/Navbar';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<p>Cart page - we build this in Step 6</p>} />
          <Route path="*" element={<p>Page not found</p>} />
        </Routes>
      </main>
    </div>
  );
}