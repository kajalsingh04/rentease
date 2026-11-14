import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          RentEase
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-indigo-600">Products</Link>
          <Link to="/cart" className="hover:text-indigo-600">Cart ({items.length})</Link>

          {user ? (
            <>
              <Link to="/my-rentals" className="hover:text-indigo-600">My Rentals</Link>
              <span className="hidden sm:inline text-gray-500">Hi, {user.name}</span>
              <button onClick={logout} className="text-red-600 hover:underline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-600">Login</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}