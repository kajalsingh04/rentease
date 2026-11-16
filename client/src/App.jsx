import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyRentals from './pages/MyRentals';
// Vendor and admin pages are loaded only when they are opened (smaller first download)
const VendorLayout = lazy(() => import('./pages/vendor/VendorLayout'));
const VendorProducts = lazy(() => import('./pages/vendor/VendorProducts'));
const ProductForm = lazy(() => import('./pages/vendor/ProductForm'));
const VendorRentals = lazy(() => import('./pages/vendor/VendorRentals'));
const VendorMaintenance = lazy(() => import('./pages/vendor/VendorMaintenance'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminClaims = lazy(() => import('./pages/admin/AdminClaims'))
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            <Route path="/" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-rentals"
              element={
                <ProtectedRoute>
                  <MyRentals />
                </ProtectedRoute>
              }
            />

            {/* Vendor dashboard: only for vendor and admin */}
            <Route
              path="/vendor"
              element={
                <ProtectedRoute roles={['vendor', 'admin']}>
                  <VendorLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="products" replace />} />
              <Route path="products" element={<VendorProducts />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="rentals" element={<VendorRentals />} />
              <Route path="maintenance" element={<VendorMaintenance />} />
            </Route>

            {/* Admin dashboard: only for admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="rentals" element={<VendorRentals title="All rentals" />} />
              <Route path="maintenance" element={<VendorMaintenance />} />
              <Route path="claims" element={<AdminClaims />} />
              <Route path="areas" element={<AdminAreas />} />
            </Route>

            <Route path="*" element={<p>Page not found</p>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}