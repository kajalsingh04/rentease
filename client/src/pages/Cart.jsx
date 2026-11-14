import { Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { rupees } from '../utils/format';

export default function Cart() {
  const { items, removeItem } = useCart();

  const monthlyTotal = items.reduce((sum, i) => sum + i.monthlyRent, 0);
  const depositTotal = items.reduce((sum, i) => sum + i.securityDeposit, 0);

  if (items.length === 0) {
    return (
      <div className="text-center mt-10">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link to="/" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-3">
        <h1 className="text-2xl font-bold mb-2">Your cart</h1>

        {items.map((item) => (
          <div key={item.productId} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
            ) : (
              <div className="w-20 h-20 bg-indigo-50 rounded-lg flex items-center justify-center text-2xl text-indigo-300">
                {item.name[0]}
              </div>
            )}

            <div className="flex-1">
              <Link to={`/products/${item.productId}`} className="font-semibold hover:text-indigo-600">
                {item.name}
              </Link>
              <p className="text-sm text-gray-500">{item.tenureMonths} months</p>
              <p className="text-sm">
                {rupees(item.monthlyRent)} / month &middot; Deposit {rupees(item.securityDeposit)}
              </p>
            </div>

            <button onClick={() => removeItem(item.productId)} className="text-sm text-red-600 hover:underline self-start">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 h-fit">
        <h2 className="font-semibold mb-3">Summary</h2>
        <div className="flex justify-between text-sm mb-1">
          <span>Total monthly rent</span>
          <b>{rupees(monthlyTotal)}</b>
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span>Refundable deposit</span>
          <b>{rupees(depositTotal)}</b>
        </div>

        <Link to="/checkout" className="block text-center bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700">
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}