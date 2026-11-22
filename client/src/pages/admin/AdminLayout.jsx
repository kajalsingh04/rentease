import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/rentals', label: 'Orders', icon: 'orders' },
  { to: '/admin/maintenance', label: 'Maintenance', icon: 'maintenance' },
  { to: '/admin/claims', label: 'Damage Claims', icon: 'claims' },
  { to: '/admin/areas', label: 'Service Areas', icon: 'areas' },
  { to: '/vendor/products', label: 'Products', icon: 'products' },
];

export default function AdminLayout() {
  return <DashboardLayout title="Admin Dashboard" links={links} />;
}