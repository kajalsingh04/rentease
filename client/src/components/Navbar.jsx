import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Icon from './Icon';

// Round user icon with a menu, for a logged-in user
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

  const itemClass = 'block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-50';
  const close = () => setOpen(false);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className="flex items-center gap-2 text-sm font-medium"
      >
        <span className="w-9 h-9 rounded-full bg-white text-brand flex items-center justify-center">
          <Icon name="profile" size={20} />
        </span>
        <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
          <Link to="/account" onClick={close} className={itemClass}>
            My Account
          </Link>
          <Link to="/account/rentals" onClick={close} className={itemClass}>
            My Rentals
          </Link>
          {user.role === 'vendor' && (
            <Link to="/vendor" onClick={close} className={itemClass}>
              Vendor Dashboard
            </Link>
          )}
          {user.role === 'admin' && (
            <Link to="/admin" onClick={close} className={itemClass}>
              Admin Dashboard
            </Link>
          )}
          <button onClick={handleLogout} className={`${itemClass} text-red-600`}>
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

  const linkClass = 'hover:text-gold';

  return (
    <header className="bg-brand text-white">
      <div className="wrap flex flex-wrap items-center gap-x-8 gap-y-3 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl font-semibold">
          <Icon name="home" size={26} className="text-gold" />
          RentEase
        </Link>

        <nav className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium">
          <Link to="/" className={linkClass}>Home</Link>
          <Link to="/products?category=furniture" className={linkClass}>Furniture</Link>
          <Link to="/products?category=appliance" className={linkClass}>Appliances</Link>
          <Link to="/#about" className={linkClass}>About</Link>
          <Link to="/#contact" className={linkClass}>Contact</Link>
        </nav>

        <form
          onSubmit={handleSearch}
          role="search"
          className="order-last w-full md:order-none md:w-auto md:flex-1 md:max-w-xs md:ml-auto relative"
        >
          <label htmlFor="header-search" className="sr-only">Search products</label>
          <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="Search products..."
            className="w-full box-border pl-10 pr-4 py-2 rounded-full text-sm bg-white text-gray-800"
          />
        </form>

        <div className="flex items-center gap-5 ml-auto md:ml-0">
          <Link to="/cart" aria-label={`Cart, ${items.length} items`} className="relative hover:text-gold">
            <Icon name="cart" size={24} />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-brand text-[11px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>

          {!loading && (user ? <AccountMenu /> : (
            <Link to="/login" className="btn btn-gold btn-sm">
              Login
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}