import { NavLink, Outlet } from 'react-router';

const tabs = [
  { to: '/vendor/products', label: 'Products' },
  { to: '/vendor/rentals', label: 'Rentals' },
  { to: '/vendor/maintenance', label: 'Maintenance' },
];

export default function VendorLayout() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Vendor dashboard</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-3">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full text-sm border ${
                isActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      {/* The page of the selected tab shows here */}
      <Outlet />
    </div>
  );
}