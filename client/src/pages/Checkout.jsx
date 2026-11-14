import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import api, { getError } from '../api/axios';
import { useCart } from '../context/CartContext';
import { rupees } from '../utils/format';

// Tomorrow in YYYY-MM-DD format (delivery cannot be today or in the past)
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export default function Checkout() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ line1: '', city: '', pincode: '', deliveryDate: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/rentals', {
        // Only the id and tenure are sent. The server takes the price from the database.
        items: items.map((i) => ({ productId: i.productId, tenureMonths: i.tenureMonths })),
        deliveryAddress: { line1: form.line1, city: form.city, pincode: form.pincode },
        deliveryDate: form.deliveryDate,
      });
      navigate('/my-rentals', { state: { ordered: true } });
      clearCart();
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <p>
        Your cart is empty.{' '}
        <Link to="/" className="text-indigo-600 underline">
          Browse products
        </Link>
      </p>
    );
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2';

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        <h1 className="text-2xl font-bold mb-2">Delivery details</h1>

        {error && <p className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</p>}

        <input name="line1" placeholder="Address (house, street, area)" value={form.line1} onChange={handleChange} required minLength={3} className={inputClass} />
        <div className="grid grid-cols-2 gap-3">
          <input name="city" placeholder="City" value={form.city} onChange={handleChange} required minLength={2} className={inputClass} />
          <input name="pincode" placeholder="Pincode (6 digits)" value={form.pincode} onChange={handleChange} required pattern="\d{6}" title="Pincode must be 6 digits" className={inputClass} />
        </div>

        <label className="block text-sm text-gray-600">
          Delivery date
          <input name="deliveryDate" type="date" min={tomorrow} value={form.deliveryDate} onChange={handleChange} required className={`${inputClass} mt-1`} />
        </label>

        <button disabled={busy} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {busy ? 'Placing order...' : 'Place order'}
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl p-4 h-fit">
        <h2 className="font-semibold mb-3">Order summary</h2>
        {items.map((i) => (
          <div key={i.productId} className="text-sm mb-2">
            <p className="font-medium">{i.name}</p>
            <p className="text-gray-500">
              {i.tenureMonths} months &middot; {rupees(i.monthlyRent)} / month
            </p>
          </div>
        ))}
        <p className="text-xs text-gray-400 mt-3">The final price is checked by our server when you place the order.</p>
      </div>
    </div>
  );
}