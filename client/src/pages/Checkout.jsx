import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import api, { getError } from '../api/axios';
import { useCart } from '../context/CartContext';
import { rupees, titleCase, tomorrowISO } from '../utils/format';

export default function Checkout() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const [areas, setAreas] = useState([]); // cities where we deliver
  const [areasLoaded, setAreasLoaded] = useState(false);
  const [form, setForm] = useState({ line1: '', city: '', pincode: '', deliveryDate: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Load the cities that the admin turned on
  useEffect(() => {
    api
      .get('/service-areas')
      .then((res) => setAreas(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setAreasLoaded(true));
  }, []);

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
        paymentMethod: 'pay_on_delivery',
      });
      navigate('/account/rentals', { state: { ordered: true } });
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
        <Link to="/products" className="text-brand underline">
          Browse products
        </Link>
      </p>
    );
  }

  const monthlyTotal = items.reduce((sum, i) => sum + i.monthlyRent, 0);
  const depositTotal = items.reduce((sum, i) => sum + i.securityDeposit, 0);
  const noCities = areasLoaded && areas.length === 0;
  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white';

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="md:col-span-2 card p-6 space-y-3">
        <h1 className="text-2xl mb-2">Delivery details</h1>

        {error && <p className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</p>}
        {noCities && (
          <p className="bg-yellow-50 text-yellow-800 text-sm p-2 rounded">
            We are not delivering to any city yet. Please try again later.
          </p>
        )}

        <input name="line1" placeholder="Address (house, street, area)" value={form.line1} onChange={handleChange} required minLength={3} className={inputClass} />
        <div className="grid grid-cols-2 gap-3">
          <select name="city" value={form.city} onChange={handleChange} required aria-label="City" className={inputClass}>
            <option value="">Select your city</option>
            {areas.map((a) => (
              <option key={a._id} value={a.city}>
                {titleCase(a.city)}
              </option>
            ))}
          </select>
          <input name="pincode" placeholder="Pincode (6 digits)" value={form.pincode} onChange={handleChange} required pattern="\d{6}" title="Pincode must be 6 digits" className={inputClass} />
        </div>

        <label className="block text-sm text-gray-600">
          Delivery date
          <input name="deliveryDate" type="date" min={tomorrowISO()} value={form.deliveryDate} onChange={handleChange} required className={`${inputClass} mt-1`} />
        </label>

        <fieldset className="pt-2">
          <legend className="text-sm font-medium mb-2">Payment method</legend>
          <label className="flex items-start gap-3 border border-brand rounded-xl px-4 py-3 bg-white">
            <input type="radio" name="payment" checked readOnly className="mt-1 accent-[#243b35]" />
            <span>
              <b className="block text-sm">Pay on delivery</b>
              <span className="text-xs text-gray-600">You pay the vendor when the product is delivered. The deposit is refundable.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 border border-gray-200 rounded-xl px-4 py-3 mt-2 opacity-60">
            <input type="radio" name="payment" disabled className="mt-1" />
            <span>
              <b className="block text-sm">Online payment</b>
              <span className="text-xs text-gray-600">Coming soon</span>
            </span>
          </label>
        </fieldset>

        <button disabled={busy || noCities} className="btn w-full">
          {busy ? 'Placing order...' : 'Place order'}
        </button>
      </form>

      <div className="card p-4 h-fit">
        <h2 className="text-lg mb-3">Order summary</h2>
        {items.map((i) => (
          <div key={i.productId} className="text-sm mb-2">
            <p className="font-medium">{i.name}</p>
            <p className="text-gray-500">
              {i.tenureMonths} months &middot; {rupees(i.monthlyRent)} / month
            </p>
          </div>
        ))}
        <div className="border-t border-gray-100 mt-3 pt-3 text-sm space-y-1">
          <p className="flex justify-between">
            <span>Total monthly rent</span>
            <b>{rupees(monthlyTotal)}</b>
          </p>
          <p className="flex justify-between">
            <span>Refundable deposit</span>
            <b>{rupees(depositTotal)}</b>
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-3">The final price is checked by our server when you place the order.</p>
      </div>
    </div>
  );
}