import { useState } from 'react';
import api, { getError } from '../api/axios';
import { depositSummary, formatDate, paymentLabel, rupees, tomorrowISO } from '../utils/format';
import StatusBadge from './StatusBadge';

export default function RentalCard({ rental, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [panel, setPanel] = useState(''); // the small form that is open: 'return', 'extend' or 'problem'
  const [pickupDate, setPickupDate] = useState('');
  const [months, setMonths] = useState(3);
  const [issue, setIssue] = useState('');

  // Run an API call. If it works, show a message, close the small form and refresh the list.
  const run = async (callApi, successMessage) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await callApi();
      setMessage(successMessage);
      setPanel('');
      onChanged();
      return true;
    } catch (err) {
      setError(getError(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const togglePanel = (name) => setPanel(panel === name ? '' : name);

  const cancel = () => {
    if (window.confirm('Cancel this rental?')) {
      run(() => api.post(`/rentals/${rental._id}/cancel`), 'Rental cancelled');
    }
  };

  const sendReturn = (e) => {
    e.preventDefault();
    run(() => api.post(`/rentals/${rental._id}/request-return`, { pickupDate }), 'Return requested');
  };

  const sendExtension = (e) => {
    e.preventDefault();
    run(() => api.post(`/rentals/${rental._id}/extend`, { months: Number(months) }), 'Extension requested');
  };

  const sendProblem = async (e) => {
    e.preventDefault();
    const sent = await run(() => api.post('/maintenance', { rentalId: rental._id, issue }), 'Maintenance request sent');
    if (sent) setIssue('');
  };

  const extension = rental.extension?.status ? rental.extension : null;
  const deposit = depositSummary(rental);
  const inputClass = 'border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white';

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
          Delivery: {formatDate(rental.deliveryDate)}, {rental.deliveryAddress.line1}, {rental.deliveryAddress.city} -{' '}
          {rental.deliveryAddress.pincode}
        </p>
        {rental.startDate && (
          <p>
            Rental period: {formatDate(rental.startDate)} to {formatDate(rental.endDate)}
          </p>
        )}
        {rental.pickupDate && ['active', 'return_requested'].includes(rental.status) && (
          <p>Pickup date: {formatDate(rental.pickupDate)}</p>
        )}

        {extension?.status === 'pending' && (
          <p className="text-orange-700">Extension request: +{extension.months} months, waiting for the vendor</p>
        )}
        {extension?.status === 'approved' && (
          <p className="text-green-700">Last extension: +{extension.months} months approved</p>
        )}
        {extension?.status === 'rejected' && (
          <p className="text-gray-500">Last extension request ({extension.months} months) was not approved</p>
        )}

        <p className="flex items-center gap-2">
          Payment: {paymentLabel(rental.paymentMethod)}
          <StatusBadge status={rental.paymentStatus || 'pending'} />
        </p>

        {rental.damageCharge > 0 && (
          <p className="text-red-600">
            Damage charge: {rupees(rental.damageCharge)} {rental.damageNote && `(${rental.damageNote})`}
          </p>
        )}
        {rental.status === 'returned' && (
          <p>
            {rental.paymentStatus === 'refunded' ? 'Deposit given back' : 'Deposit to be given back'}:{' '}
            <b>{rupees(deposit.refund)}</b>
            {deposit.extra > 0 && <span className="text-red-600"> &middot; You must pay {rupees(deposit.extra)} more for the damage</span>}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      {message && <p className="text-sm text-green-600 mt-2">{message}</p>}

      <div className="flex flex-wrap gap-2 mt-3">
        {rental.status === 'pending' && (
          <button disabled={busy} onClick={cancel} className="text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded-lg disabled:opacity-50">
            Cancel
          </button>
        )}
        {rental.status === 'active' && (
          <button onClick={() => togglePanel('return')} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg">
            Request return
          </button>
        )}
        {rental.status === 'active' && extension?.status !== 'pending' && (
          <button onClick={() => togglePanel('extend')} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg">
            Extend rental
          </button>
        )}
        {['active', 'return_requested'].includes(rental.status) && (
          <button onClick={() => togglePanel('problem')} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg">
            Report a problem
          </button>
        )}
      </div>

      {panel === 'return' && (
        <form onSubmit={sendReturn} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm text-gray-600">
            Pickup date
            <input type="date" min={tomorrowISO()} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required className={`${inputClass} block mt-1`} />
          </label>
          <button disabled={busy} className="btn btn-sm">
            Send return request
          </button>
        </form>
      )}

      {panel === 'extend' && (
        <form onSubmit={sendExtension} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm text-gray-600">
            Extra months
            <select value={months} onChange={(e) => setMonths(e.target.value)} className={`${inputClass} block mt-1`}>
              {[1, 2, 3, 6, 12].map((m) => (
                <option key={m} value={m}>
                  {m} {m === 1 ? 'month' : 'months'}
                </option>
              ))}
            </select>
          </label>
          <button disabled={busy} className="btn btn-sm">
            Send extension request
          </button>
          <p className="w-full text-xs text-gray-500">
            The rent stays {rupees(rental.monthlyRent)} per month. The vendor must approve the request.
          </p>
        </form>
      )}

      {panel === 'problem' && (
        <form onSubmit={sendProblem} className="mt-3 space-y-2">
          <textarea
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            placeholder="Describe the problem (at least 5 letters)"
            required
            minLength={5}
            rows={3}
            className={`${inputClass} w-full`}
          />
          <button disabled={busy} className="btn btn-sm">
            Send request
          </button>
        </form>
      )}
    </div>
  );
}