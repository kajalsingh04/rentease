import { useEffect, useState } from 'react';
import api, { getError } from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/format';

export default function VendorMaintenance() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api
      .get('/maintenance/vendor')
      .then((res) => setRequests(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [refresh]);

  const changeStatus = async (id, status) => {
    setError('');
    try {
      await api.patch(`/maintenance/${id}/status`, { status });
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Maintenance requests</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}
      {!loading && requests.length === 0 && <p className="text-gray-500">No requests.</p>}

      <div className="space-y-3">
        {requests.map((q) => (
          <div key={q._id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{q.rental?.product?.name || 'Product'}</h3>
                <p className="text-sm text-gray-600 mt-1">{q.issue}</p>
              </div>
              <StatusBadge status={q.status} />
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {q.user?.name} &middot; {q.user?.phone || 'no phone'} &middot; {q.rental?.deliveryAddress?.line1},{' '}
              {q.rental?.deliveryAddress?.city}
            </p>
            <p className="text-xs text-gray-400">Sent on {formatDate(q.createdAt)}</p>

            {q.status !== 'resolved' && (
              <div className="flex gap-2 mt-3">
                {q.status === 'open' && (
                  <button onClick={() => changeStatus(q._id, 'in_progress')} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg">
                    Start work
                  </button>
                )}
                <button onClick={() => changeStatus(q._id, 'resolved')} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg">
                  Mark resolved
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}