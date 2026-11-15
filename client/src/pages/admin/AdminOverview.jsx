import { useEffect, useState } from 'react';
import api, { getError } from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { rupees } from '../../utils/format';

export default function AdminOverview() {
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

  // The 5 KPIs from the project document, and 2 extra numbers
  const cards = [
    { label: 'Active rentals', value: stats.activeRentals, hint: 'Products that are with customers now' },
    { label: 'Monthly recurring revenue', value: rupees(stats.monthlyRecurringRevenue), hint: 'Rent of all active rentals, per month' },
    { label: 'Product utilization', value: `${stats.productUtilizationPercent}%`, hint: 'Items rented out / all items' },
    { label: 'Customer retention', value: `${stats.customerRetentionPercent}%`, hint: 'Customers with more than one order' },
    {
      label: 'Maintenance resolution time',
      value: stats.avgMaintenanceResolutionHours === null ? '-' : `${stats.avgMaintenanceResolutionHours} hours`,
      hint: 'Average time to resolve a request',
    },
    { label: 'Total users', value: stats.totalUsers, hint: 'Customers, vendors and admins' },
    { label: 'Visible products', value: stats.totalProducts, hint: 'Products shown in the shop' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-3xl font-bold mt-1">{c.value}</p>
            <p className="text-xs text-gray-400 mt-2">{c.hint}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-3">Rentals by status</h2>
      {Object.keys(stats.rentalsByStatus).length === 0 ? (
        <p className="text-gray-500">No rentals yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {Object.entries(stats.rentalsByStatus).map(([status, count]) => (
            <div key={status} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <StatusBadge status={status} />
              <span className="text-xl font-bold">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}