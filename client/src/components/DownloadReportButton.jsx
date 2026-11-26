import { useState } from 'react';
import api, { getError } from '../api/axios';

// Admin: downloads all orders as a CSV file (opens in Excel)
export default function DownloadReportButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const download = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await api.get('/admin/reports/rentals', { responseType: 'blob' });

      // Make a temporary link to the file and click it
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rentease-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button onClick={download} disabled={busy} className="btn btn-sm">
        {busy ? 'Preparing...' : 'Download orders report (CSV)'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}