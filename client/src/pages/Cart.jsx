import { Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { rupees } from '../utils/format';

export default function Cart() {
  const { items, changeTenure, removeItem } = useCart();

  const monthlyTotal = items.reduce((sum, i) => sum + i.monthlyRent, 0);
  const depositTotal = items.reduce((sum, i) => sum + i.securityDeposit, 0);

  if (items.length === 0) {
    return (
      <div className="text-center mt-10">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link to="/products" className="btn">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-[28px]">Your cart</h1>

        {items.map((item) => (
          <div key={item.productId} className="card p-4 flex gap-4">
            {item.image ? (
              <img src={item.image} alt="" className="w-24 h-24 object-cover rounded-xl" />
            ) : (
              <div className="w-24 h-24 bg-brand-soft rounded-xl flex items-center justify-center font-display text-3xl text-brand">
                {item.name[0]}
              </div>
            )}

            <div className="flex-1">
              <Link to={`/products/${item.productId}`} className="font-semibold hover:text-brand">
                {item.name}
              </Link>

              {item.tenureOptions ? (
                <div className="mt-2">
                  <label htmlFor={`plan-${item.productId}`} className="text-xs text-gray-500 block">
                    Rental plan
                  </label>
                  <select
                    id={`plan-${item.productId}`}
                    value={item.tenureMonths}
                    onChange={(e) => changeTenure(item.productId, e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                  >
                    {item.tenureOptions.map((o) => (
                      <option key={o.months} value={o.months}>
                        {o.months} months - {rupees(o.monthlyRent)} / month
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-sm text-gray-500">{item.tenureMonths} months</p>
              )}

              <p className="text-sm mt-2">
                {rupees(item.monthlyRent)} / month &middot; Deposit {rupees(item.securityDeposit)}
              </p>
            </div>

            <button onClick={() => removeItem(item.productId)} className="text-sm text-red-600 hover:underline self-start">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="card p-5 h-fit">
        <h2 className="text-lg mb-3">Summary</h2>
        <div className="flex justify-between text-sm mb-1">
          <span>Total monthly rent</span>
          <b>{rupees(monthlyTotal)}</b>
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span>Refundable deposit</span>
          <b>{rupees(depositTotal)}</b>
        </div>

        <Link to="/checkout" className="btn w-full">
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}