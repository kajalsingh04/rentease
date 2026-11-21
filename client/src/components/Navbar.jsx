import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// "Hi, Name" menu for a logged-in user
function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close the menu when the user clicks outside of it
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/');
  };

  const itemClass = 'block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:text-brand';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-1 font-medium text-[15px] hover:text-brand"
      >
        Hi, {user.name.split(' ')[0]}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
          <Link to="/my-rentals" onClick={() => setOpen(false)} className={itemClass}>
            My Rentals
          </Link>
          {user.role === 'vendor' && (
            <Link to="/vendor" onClick={() => setOpen(false)} className={itemClass}>
              Dashboard
            </Link>
          )}
          {user.role === 'admin' && (
            <Link to="/admin" onClick={() => setOpen(false)} className={itemClass}>
              Admin
            </Link>
          )}
          <button onClick={handleLogout} className={`${itemClass} text-red-600 hover:text-red-700`}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, loading } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  // Search from the header: go to the products page with the search text
  const handleSearch = (e) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get('q') || '').trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    e.currentTarget.reset();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="wrap flex flex-wrap items-center gap-x-7 gap-y-3 py-3.5">
        <Link to="/" className="font-display text-2xl font-semibold text-brand">
          RentEase
        </Link>

        <nav className="flex gap-5 font-medium text-[15px]">
          <Link to="/products?category=furniture" className="hover:text-brand">Furniture</Link>
          <Link to="/products?category=appliance" className="hover:text-brand">Appliances</Link>
          <Link to="/#how-it-works" className="hover:text-brand">How it works</Link>
        </nav>

        <form onSubmit={handleSearch} role="search" className="order-last w-full md:order-none md:w-auto md:flex-1 md:min-w-[200px]">
          <label htmlFor="header-search" className="sr-only">Search products</label>
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="Search beds, sofas, fridge..."
            className="w-full box-border px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white"
          />
        </form>

        <div className="flex items-center gap-5 ml-auto md:ml-0">
          <Link to="/cart" className="font-medium text-[15px] hover:text-brand flex items-center gap-1.5">
            Cart
            {items.length > 0 && (
              <span className="bg-accent text-white text-xs font-semibold rounded-full px-2 py-0.5">{items.length}</span>
            )}
          </Link>

          {!loading && (user ? <AccountMenu /> : (
            <Link to="/login" className="btn" style={{ padding: '10px 20px' }}>
              Login
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}