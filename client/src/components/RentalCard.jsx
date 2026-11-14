import { useState } from 'react';
import api, { getError } from '../api/axios';
import { formatDate, rupees } from '../utils/format';
import StatusBadge from './StatusBadge';

export default function RentalCard({ rental, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showProblem, setShowProblem] = useState(false);
  const [issue, setIssue] = useState('');

  // Run an API call, then refresh the list
  const run = async (callApi, successMessage) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await callApi();
      setMessage(successMessage);
      onChanged();
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    if (window.confirm('Cancel this rental?')) {
      run(() => api.post(`/rentals/${rental._id}/cancel`), 'Rental cancelled');
    }
  };

  const requestReturn = () => run(() => api.post(`/rentals/${rental._id}/request-return`), 'Return requested');

  const sendProblem = async (e) => {
    e.preventDefault();
    await run(() => api.post('/maintenance', { rentalId: rental._id, issue }), 'Maintenance request sent');
    setIssue('');
    setShowProblem(false);
  };

  const canReport = ['active', 'return_requested'].includes(rental.status);

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
          Delivery: {formatDate(rental.deliveryDate)}, {rental.deliveryAddress.line1}, {rental.deliveryAddress.city} -{' '}
          {rental.deliveryAddress.pincode}
        </p>
        {rental.startDate && (
          <p>
            Rental period: {formatDate(rental.startDate)} to {formatDate(rental.endDate)}
          </p>
        )}
        {rental.damageCharge > 0 && (
          <p className="text-red-600">
            Damage charge: {rupees(rental.damageCharge)} {rental.damageNote && `(${rental.damageNote})`}
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
          <button disabled={busy} onClick={requestReturn} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg disabled:opacity-50">
            Request return
          </button>
        )}
        {canReport && (
          <button onClick={() => setShowProblem(!showProblem)} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg">
            Report a problem
          </button>
        )}
      </div>

      {showProblem && (
        <form onSubmit={sendProblem} className="mt-3 space-y-2">
          <textarea
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            placeholder="Describe the problem (at least 5 letters)"
            required
            minLength={5}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button disabled={busy} className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg disabled:opacity-50">
            Send request
          </button>
        </form>
      )}
    </div>
  );
}