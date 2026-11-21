import { NavLink, Outlet } from 'react-router';

const tabs = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/rentals', label: 'Rentals' },
  { to: '/admin/maintenance', label: 'Maintenance' },
  { to: '/admin/claims', label: 'Damage claims' },
  { to: '/admin/areas', label: 'Service areas' },
  { to: '/vendor/products', label: 'Products' },
];

export default function AdminLayout() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin dashboard</h1>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full text-sm border ${
                isActive ? 'bg-accent text-white border-accent' : 'bg-white border-gray-300'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}