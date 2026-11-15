import { useEffect, useState } from 'react';
import api, { getError } from '../../api/axios';
import VendorRentalCard from '../../components/VendorRentalCard';

const statuses = ['', 'pending', 'confirmed', 'active', 'return_requested', 'returned', 'cancelled'];

export default function VendorRentals({ title = 'Rentals of my products' }) {
  const [rentals, setRentals] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api
      .get('/rentals/vendor', { params: { status } })
      .then((res) => setRentals(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [status, refresh]);

  const reload = () => setRefresh((n) => n + 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s ? s.replace('_', ' ') : 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && rentals.length === 0 && <p className="text-gray-500">No rentals found.</p>}

      <div className="space-y-3">
        {rentals.map((r) => (
          <VendorRentalCard key={r._id} rental={r} onChanged={reload} />
        ))}
      </div>
    </div>
  );
}