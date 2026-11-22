import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import api, { getError } from '../../api/axios';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { formatDate, rupees } from '../../utils/format';

const running = ['active', 'return_requested']; // the product is with the customer
const current = ['pending', 'confirmed', ...running];

export default function AccountOverview() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/rentals/my')
      .then((res) => setRentals(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, []);

  const activeRentals = rentals.filter((r) => running.includes(r.status));
  const pendingCount = rentals.filter((r) => r.status === 'pending').length;
  const monthlyRent = activeRentals.reduce((sum, r) => sum + r.monthlyRent, 0);
  const latest = rentals.filter((r) => current.includes(r.status)).slice(0, 3);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <h1 className="text-2xl">Customer Dashboard</h1>
        <p className="text-sm text-gray-600">Hello, {user.name}</p>
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon="rentals" label="Active Rentals" value={loading ? '-' : activeRentals.length} />
        <StatCard icon="history" label="Pending Orders" value={loading ? '-' : pendingCount} tone="gold" />
        <StatCard icon="products" label="Monthly Rent Now" value={loading ? '-' : rupees(monthlyRent)} tone="blue" />
      </div>

      <div className="flex items-end justify-between mt-8 mb-3">
        <h2 className="text-lg">My Rentals</h2>
        <Link to="/account/rentals" className="text-sm font-medium text-brand hover:underline">View All →</Link>
      </div>

      {!loading && latest.length === 0 && (
        <p className="text-gray-500">
          You have no current rentals.{' '}
          <Link to="/products" className="text-brand underline">
            Browse products
          </Link>
        </p>
      )}

      <div className="space-y-3">
        {latest.map((r) => (
          <div key={r._id} className="card p-4 flex flex-wrap items-center gap-4">
            {r.product?.images?.[0] ? (
              <img src={r.product.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-cream-dark flex items-center justify-center font-display text-2xl text-brand/60">
                {(r.product?.name || '?')[0]}
              </div>
            )}

            <div className="flex-1 min-w-[150px]">
              <p className="font-semibold">{r.product?.name || 'Product removed'}</p>
              <p className="text-sm text-gray-600">
                {rupees(r.monthlyRent)} / month &middot; {r.tenureMonths} months
              </p>
            </div>

            <div className="text-sm">
              <StatusBadge status={r.status} />
              {r.endDate && <p className="text-xs text-gray-500 mt-1">Return date: {formatDate(r.endDate)}</p>}
            </div>

            <Link to="/account/rentals" className="btn btn-sm">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}