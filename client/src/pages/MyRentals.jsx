import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import api, { getError } from '../api/axios';
import RentalCard from '../components/RentalCard';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/format';

const tabs = [
  { value: 'current', label: 'Current', statuses: ['pending', 'confirmed', 'active', 'return_requested'] },
  { value: 'history', label: 'History', statuses: ['returned', 'cancelled'] },
];

export default function MyRentals() {
  const location = useLocation();
  const [rentals, setRentals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState('current');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0); // change this number to load the data again

  useEffect(() => {
    Promise.all([api.get('/rentals/my'), api.get('/maintenance/my')])
      .then(([rentalRes, requestRes]) => {
        setRentals(rentalRes.data);
        setRequests(requestRes.data);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [refresh]);

  const reload = () => setRefresh((n) => n + 1);

  const activeTab = tabs.find((t) => t.value === tab);
  const shown = rentals.filter((r) => activeTab.statuses.includes(r.status));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My rentals</h1>

      {location.state?.ordered && (
        <p className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">
          Order placed. The vendor will confirm it soon.
        </p>
      )}

      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-full text-sm border ${
              tab === t.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && shown.length === 0 && (
        <p className="text-gray-500">
          Nothing here yet.{' '}
          <Link to="/" className="text-indigo-600 underline">
            Browse products
          </Link>
        </p>
      )}

      <div className="space-y-3">
        {shown.map((r) => (
          <RentalCard key={r._id} rental={r} onChanged={reload} />
        ))}
      </div>

      {requests.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-3">My maintenance requests</h2>
          <div className="space-y-2">
            {requests.map((q) => (
              <div key={q._id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{q.rental?.product?.name || 'Product'}</p>
                  <p className="text-sm text-gray-600">{q.issue}</p>
                  <p className="text-xs text-gray-400 mt-1">Sent on {formatDate(q.createdAt)}</p>
                </div>
                <StatusBadge status={q.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}