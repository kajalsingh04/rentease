import { useEffect, useState } from 'react';
import api, { getError } from '../../api/axios';
import LineChart from '../../components/LineChart';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { formatDate, rupees } from '../../utils/format';
import DownloadReportButton from '../../components/DownloadReportButton';

export default function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(getError(err)));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return <p>Loading...</p>;

  // The 5 KPIs from the project document
  const kpis = [
    { label: 'Active rentals', value: stats.activeRentals, hint: 'Products that are with customers now' },
    { label: 'Monthly recurring revenue', value: rupees(stats.monthlyRecurringRevenue), hint: 'Rent of all active rentals, per month' },
    { label: 'Product utilization', value: `${stats.productUtilizationPercent}%`, hint: 'Items rented out / all items' },
    { label: 'Customer retention', value: `${stats.customerRetentionPercent}%`, hint: 'Customers with more than one order' },
    {
      label: 'Maintenance resolution time',
      value: stats.avgMaintenanceResolutionHours === null ? '-' : `${stats.avgMaintenanceResolutionHours} hours`,
      hint: 'Average time to resolve a request',
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <h1 className="text-2xl">Admin Dashboard</h1>
        <DownloadReportButton />
        <p className="text-sm text-gray-600">Hello, {user.name}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="users" label="Total Users" value={stats.totalUsers} />
        <StatCard icon="profile" label="Total Vendors" value={stats.totalVendors} tone="gold" />
        <StatCard icon="products" label="Visible Products" value={stats.totalProducts} />
        <StatCard icon="orders" label="Total Orders" value={stats.totalOrders} tone="blue" />
      </div>

      <div className="grid lg:grid-cols-5 gap-5 mt-6">
        <div className="lg:col-span-3 card p-5">
          <h2 className="text-base mb-3">Rental Analytics (orders per month)</h2>
          <LineChart data={stats.monthlyRentals} />
        </div>

        <div className="lg:col-span-2 card p-5">
          <h2 className="text-base mb-3">Recent Orders</h2>
          {stats.recentOrders.length === 0 && <p className="text-sm text-gray-500">No orders yet.</p>}
          <ul className="space-y-3">
            {stats.recentOrders.map((o) => (
              <li key={o._id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{o.product?.name || 'Product removed'}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {o.user?.name} &middot; {formatDate(o.createdAt)}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="text-lg mt-8 mb-3">Business KPIs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((c) => (
          <div key={c.label} className="card p-4">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-3xl font-display font-semibold text-brand mt-1">{c.value}</p>
            <p className="text-xs text-gray-400 mt-2">{c.hint}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg mt-8 mb-3">Rentals by status</h2>
      {Object.keys(stats.rentalsByStatus).length === 0 ? (
        <p className="text-gray-500">No rentals yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {Object.entries(stats.rentalsByStatus).map(([status, count]) => (
            <div key={status} className="card px-4 py-3 flex items-center gap-3">
              <StatusBadge status={status} />
              <span className="text-xl font-bold">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}