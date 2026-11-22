import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/vendor', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/vendor/products', label: 'My Products', icon: 'products' },
  { to: '/vendor/rentals', label: 'Orders', icon: 'orders' },
  { to: '/vendor/maintenance', label: 'Maintenance', icon: 'maintenance' },
];

export default function VendorLayout() {
  return <DashboardLayout title="Vendor Dashboard" links={links} />;
}