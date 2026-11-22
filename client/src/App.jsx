import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Dashboards are loaded only when they are opened (smaller first download)
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'));
const AccountOverview = lazy(() => import('./pages/account/AccountOverview'));
const AccountRentals = lazy(() => import('./pages/account/AccountRentals'));
const AccountProfile = lazy(() => import('./pages/account/AccountProfile'));
const VendorLayout = lazy(() => import('./pages/vendor/VendorLayout'));
const VendorOverview = lazy(() => import('./pages/vendor/VendorOverview'));
const VendorProducts = lazy(() => import('./pages/vendor/VendorProducts'));
const ProductForm = lazy(() => import('./pages/vendor/ProductForm'));
const VendorRentals = lazy(() => import('./pages/vendor/VendorRentals'));
const VendorMaintenance = lazy(() => import('./pages/vendor/VendorMaintenance'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminClaims = lazy(() => import('./pages/admin/AdminClaims'));
const AdminAreas = lazy(() => import('./pages/admin/AdminAreas'));

// Which rentals each page of "My Account" shows
const CURRENT = ['pending', 'confirmed', 'active', 'return_requested'];
const HISTORY = ['returned', 'cancelled'];

// Go to the top of the page when the page changes
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

// Gives the normal pages a centered width. The home page does not use it, because it has full width sections.
function Container() {
  return (
    <div className="wrap py-8">
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ScrollToTop />

      <main className="flex-1">
        <Suspense fallback={<p className="wrap py-8">Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route element={<Container />}>
              <Route path="/products" element={<Products />} />
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

              {/* Old address of My Rentals */}
              <Route path="/my-rentals" element={<Navigate to="/account/rentals" replace />} />

              {/* Customer dashboard */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AccountOverview />} />
                <Route path="rentals" element={<AccountRentals title="My Rentals" statuses={CURRENT} showRequests />} />
                <Route path="history" element={<AccountRentals title="Rental History" statuses={HISTORY} />} />
                <Route
                  path="returns"
                  element={
                    <AccountRentals title="Return Requests" statuses={['return_requested']} emptyText="You have no return requests." />
                  }
                />
                <Route path="profile" element={<AccountProfile />} />
              </Route>

              {/* Vendor dashboard: only for vendor and admin */}
              <Route
                path="/vendor"
                element={
                  <ProtectedRoute roles={['vendor', 'admin']}>
                    <VendorLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<VendorOverview />} />
                <Route path="products" element={<VendorProducts />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
                <Route path="rentals" element={<VendorRentals title="Orders of my products" />} />
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
                <Route path="rentals" element={<VendorRentals title="All orders" />} />
                <Route path="maintenance" element={<VendorMaintenance />} />
                <Route path="claims" element={<AdminClaims />} />
                <Route path="areas" element={<AdminAreas />} />
              </Route>

              <Route path="*" element={<p>Page not found</p>} />
            </Route>
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}