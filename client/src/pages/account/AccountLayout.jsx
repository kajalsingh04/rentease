import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/account', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/account/rentals', label: 'My Rentals', icon: 'rentals' },
  { to: '/account/history', label: 'Rental History', icon: 'history' },
  { to: '/account/returns', label: 'Return Requests', icon: 'returns' },
  { to: '/account/profile', label: 'My Profile', icon: 'profile' },
];

export default function AccountLayout() {
  return <DashboardLayout title="My Account" links={links} />;
}