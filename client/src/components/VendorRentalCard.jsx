import { useState } from 'react';
import api, { getError } from '../api/axios';
import { depositSummary, formatDate, paymentLabel, rupees, tomorrowISO } from '../utils/format';
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
  const [panel, setPanel] = useState(''); // the small form that is open: 'return' or 'schedule'
  const [damageNote, setDamageNote] = useState('');
  const [damageCharge, setDamageCharge] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');

  // Send a request to /rentals/:id/<path>. If it works, close the small form and refresh the list.
  const send = async (path, body) => {
    setBusy(true);
    setError('');
    try {
      await api.patch(`/rentals/${rental._id}/${path}`, body);
      setPanel('');
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
    send('status', body);
  };

  const beforeDelivery = ['pending', 'confirmed'].includes(rental.status);
  const rented = ['active', 'return_requested'].includes(rental.status);

  const submitSchedule = (e) => {
    e.preventDefault();
    send('schedule', beforeDelivery ? { deliveryDate: scheduleDate } : { pickupDate: scheduleDate });
  };

  const extension = rental.extension?.status ? rental.extension : null;
  const payment = rental.paymentStatus || 'pending';
  const deposit = depositSummary(rental);
  const inputClass = 'border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white';
  const smallButton = 'text-sm px-3 py-1.5 rounded-lg border disabled:opacity-50';

  return (
    <div className="card p-4">
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
        {rental.status === 'active' && rental.pickupDate && <p>Pickup date: {formatDate(rental.pickupDate)}</p>}

        <p className="flex items-center gap-2">
          Payment: {paymentLabel(rental.paymentMethod)}
          <StatusBadge status={payment} />
        </p>

        {rental.status === 'returned' && (
          <p>
            {payment === 'refunded' ? 'Deposit given back' : 'Deposit to give back'}: <b>{rupees(deposit.refund)}</b>
            {deposit.extra > 0 && <span className="text-red-600"> &middot; Customer must pay {rupees(deposit.extra)} more for the damage</span>}
          </p>
        )}
      </div>

      {extension?.status === 'pending' && (
        <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
          <p className="text-orange-800">
            The customer asks to keep this product for {extension.months} more months (rent stays {rupees(rental.monthlyRent)} per
            month).
          </p>
          <div className="flex gap-2 mt-2">
            {rental.status === 'active' && (
              <button disabled={busy} onClick={() => send('extension', { decision: 'approved' })} className={`${smallButton} bg-green-600 text-white border-green-600`}>
                Approve
              </button>
            )}
            <button disabled={busy} onClick={() => send('extension', { decision: 'rejected' })} className={`${smallButton} border-red-300 text-red-600`}>
              Reject
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <div className="flex flex-wrap gap-2 mt-3">
        {(actions[rental.status] || []).map((a) => (
          <button
            key={a.status}
            disabled={busy}
            onClick={() => send('status', { status: a.status })}
            className={`${smallButton} ${a.danger ? 'border-red-300 text-red-600' : 'bg-accent text-white border-accent'}`}
          >
            {a.label}
          </button>
        ))}

        {rented && (
          <button onClick={() => setPanel(panel === 'return' ? '' : 'return')} className={`${smallButton} bg-accent text-white border-accent`}>
            Mark returned
          </button>
        )}

        {(beforeDelivery || rented) && (
          <button onClick={() => setPanel(panel === 'schedule' ? '' : 'schedule')} className={`${smallButton} border-gray-300`}>
            {beforeDelivery ? 'Change delivery date' : 'Set pickup date'}
          </button>
        )}

        {payment === 'pending' && ['confirmed', 'active', 'return_requested', 'returned'].includes(rental.status) && (
          <button disabled={busy} onClick={() => send('payment', { paymentStatus: 'paid' })} className={`${smallButton} border-gray-300`}>
            Mark payment received
          </button>
        )}

        {payment === 'paid' && ['returned', 'cancelled'].includes(rental.status) && (
          <button disabled={busy} onClick={() => send('payment', { paymentStatus: 'refunded' })} className={`${smallButton} border-gray-300`}>
            Mark deposit given back
          </button>
        )}
      </div>

      {panel === 'return' && (
        <form onSubmit={submitReturn} className="mt-3 grid sm:grid-cols-3 gap-2 items-end">
          <input
            value={damageNote}
            onChange={(e) => setDamageNote(e.target.value)}
            placeholder="Damage note (if any)"
            className={`${inputClass} sm:col-span-2`}
          />
          <input
            type="number"
            min="0"
            value={damageCharge}
            onChange={(e) => setDamageCharge(e.target.value)}
            placeholder="Damage charge ₹"
            className={inputClass}
          />
          <button disabled={busy} className="bg-green-600 text-white text-sm px-3 py-2 rounded-lg sm:col-span-3 disabled:opacity-50">
            Confirm return
          </button>
        </form>
      )}

      {panel === 'schedule' && (
        <form onSubmit={submitSchedule} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm text-gray-600">
            {beforeDelivery ? 'New delivery date' : 'Pickup date'}
            <input type="date" min={tomorrowISO()} value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} required className={`${inputClass} block mt-1`} />
          </label>
          <button disabled={busy} className="btn btn-sm">
            Save date
          </button>
        </form>
      )}
    </div>
  );
}