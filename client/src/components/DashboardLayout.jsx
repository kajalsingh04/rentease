import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

// Page with a green menu on the left (customer, vendor and admin dashboards use it)
// links = [{ to: '/account', label: 'Dashboard', icon: 'dashboard', end: true }, ...]
export default function DashboardLayout({ title, links }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const itemClass = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm whitespace-nowrap';

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <aside className="w-full md:w-56 shrink-0">
        <nav className="bg-brand text-white rounded-2xl p-3 flex md:flex-col gap-1 overflow-x-auto md:sticky md:top-4">
          <p className="hidden md:block font-display font-semibold px-3 pt-2 pb-3 text-gold">{title}</p>

          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `${itemClass} ${isActive ? 'bg-white/15 font-semibold' : 'text-white/80 hover:bg-white/10'}`
              }
            >
              <Icon name={l.icon} size={18} />
              {l.label}
            </NavLink>
          ))}

          <button onClick={handleLogout} className={`${itemClass} text-white/80 hover:bg-white/10 md:mt-2`}>
            <Icon name="logout" size={18} />
            Logout
          </button>
        </nav>
      </aside>

      <section className="flex-1 min-w-0 w-full">
        <Outlet />
      </section>
    </div>
  );
}