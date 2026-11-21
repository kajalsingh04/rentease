import { useState } from 'react';
import api, { getError } from '../api/axios';
import { formatDate, rupees } from '../utils/format';
import StatusBadge from './StatusBadge';

// Buttons that the vendor can see for each status
const actions = {
  pending: [
    { status: 'confirmed', label: 'Confirm order' },
    { status: 'cancelled', label: 'Cancel', danger: true },
  ],
  confirmed: [
    { status: 'active', label: 'Mark delivered' },
    { status: 'cancelled', label: 'Cancel', danger: true },
  ],
};

export default function VendorRentalCard({ rental, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showReturn, setShowReturn] = useState(false);
  const [damageNote, setDamageNote] = useState('');
  const [damageCharge, setDamageCharge] = useState('');

  const changeStatus = async (body) => {
    setBusy(true);
    setError('');
    try {
      await api.patch(`/rentals/${rental._id}/status`, body);
      onChanged();
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const submitReturn = (e) => {
    e.preventDefault();
    const body = { status: 'returned' };
    if (damageNote) body.damageNote = damageNote;
    if (damageCharge) body.damageCharge = Number(damageCharge);
    changeStatus(body);
  };

  const canReturn = ['active', 'return_requested'].includes(rental.status);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{rental.product?.name || 'Product removed'}</h3>
          <p className="text-sm text-gray-500">
            {rental.tenureMonths} months &middot; {rupees(rental.monthlyRent)} / month &middot; Deposit{' '}
            {rupees(rental.securityDeposit)}
          </p>
        </div>
        <StatusBadge status={rental.status} />
      </div>

      <div className="text-sm text-gray-600 mt-3 space-y-0.5">
        <p>
          Customer: <b>{rental.user?.name}</b> &middot; {rental.user?.phone || 'no phone'} &middot; {rental.user?.email}
        </p>
        <p>
          Deliver on {formatDate(rental.deliveryDate)} to {rental.deliveryAddress.line1}, {rental.deliveryAddress.city} -{' '}
          {rental.deliveryAddress.pincode}
        </p>
        {rental.startDate && (
          <p>
            Rental period: {formatDate(rental.startDate)} to {formatDate(rental.endDate)}
          </p>
        )}
        {rental.status === 'return_requested' && (
          <p className="text-orange-600">
            Customer wants to return this product. Pickup date: {formatDate(rental.pickupDate)}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <div className="flex flex-wrap gap-2 mt-3">
        {(actions[rental.status] || []).map((a) => (
          <button
            key={a.status}
            disabled={busy}
            onClick={() => changeStatus({ status: a.status })}
            className={`text-sm px-3 py-1.5 rounded-lg border disabled:opacity-50 ${
              a.danger ? 'border-red-300 text-red-600' : 'bg-accent text-white border-accent'
            }`}
          >
            {a.label}
          </button>
        ))}

        {canReturn && (
          <button onClick={() => setShowReturn(!showReturn)} className="text-sm px-3 py-1.5 rounded-lg bg-accent text-white">
            Mark returned
          </button>
        )}
      </div>

      {showReturn && (
        <form onSubmit={submitReturn} className="mt-3 grid sm:grid-cols-3 gap-2 items-end">
          <input
            value={damageNote}
            onChange={(e) => setDamageNote(e.target.value)}
            placeholder="Damage note (if any)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            type="number"
            min="0"
            value={damageCharge}
            onChange={(e) => setDamageCharge(e.target.value)}
            placeholder="Damage charge ₹"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button disabled={busy} className="bg-green-600 text-white text-sm px-3 py-2 rounded-lg sm:col-span-3 disabled:opacity-50">
            Confirm return
          </button>
        </form>
      )}
    </div>
  );
}