import { useEffect, useState } from 'react';
import api, { getError } from '../../api/axios';
import { formatDate, rupees } from '../../utils/format';

function ClaimCard({ rental, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [charge, setCharge] = useState(rental.damageCharge);
  const [note, setNote] = useState(rental.damageNote || '');
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.patch(`/admin/rentals/${rental._id}/damage`, {
        damageCharge: Number(charge),
        damageNote: note,
      });
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{rental.product?.name || 'Product removed'}</h3>
          <p className="text-sm text-gray-500">
            Customer: {rental.user?.name} &middot; {rental.user?.phone || 'no phone'} &middot; {rental.user?.email}
          </p>
          <p className="text-xs text-gray-400">Last update: {formatDate(rental.updatedAt)}</p>
        </div>
        <p className="text-xl font-bold text-red-600">{rupees(rental.damageCharge)}</p>
      </div>

      <p className="text-sm text-gray-600 mt-2">Note: {rental.damageNote || 'no note'}</p>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {editing ? (
        <form onSubmit={save} className="mt-3 grid sm:grid-cols-3 gap-2">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:col-span-2" />
          <input type="number" min="0" value={charge} onChange={(e) => setCharge(e.target.value)} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <div className="sm:col-span-3 flex gap-2">
            <button className="bg-accent text-white text-sm px-3 py-1.5 rounded-lg">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setEditing(true)} className="mt-3 text-sm border border-gray-300 px-3 py-1.5 rounded-lg">
          Resolve dispute (change charge)
        </button>
      )}
    </div>
  );
}

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api
      .get('/admin/damage-claims')
      .then((res) => setClaims(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [refresh]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Damage claims</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && claims.length === 0 && <p className="text-gray-500">No damage claims.</p>}

      <div className="space-y-3">
        {claims.map((r) => (
          <ClaimCard key={r._id} rental={r} onChanged={() => setRefresh((n) => n + 1)} />
        ))}
      </div>
    </div>
  );
}