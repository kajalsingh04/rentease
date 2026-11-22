import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import api, { getError } from '../../api/axios';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { rupees } from '../../utils/format';

const running = ['active', 'return_requested'];

export default function VendorOverview() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [openRequests, setOpenRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/products/mine'), api.get('/rentals/vendor'), api.get('/maintenance/vendor', { params: { status: 'open' } })])
      .then(([productRes, rentalRes, requestRes]) => {
        setProducts(productRes.data);
        setRentals(rentalRes.data);
        setOpenRequests(requestRes.data.length);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, []);

  const show = (value) => (loading ? '-' : value);
  const activeRentals = rentals.filter((r) => running.includes(r.status));
  const income = activeRentals.reduce((sum, r) => sum + r.monthlyRent, 0);
  const pending = rentals.filter((r) => r.status === 'pending').length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <h1 className="text-2xl">Vendor Dashboard</h1>
        <p className="text-sm text-gray-600">Hello, {user.name}</p>
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon="products" label="Total Products" value={show(products.length)} />
        <StatCard icon="orders" label="Total Orders" value={show(rentals.length)} tone="gold" />
        <StatCard icon="rentals" label="Active Rentals" value={show(activeRentals.length)} />
        <StatCard icon="history" label="Orders to Confirm" value={show(pending)} tone="gold" />
        <StatCard icon="products" label="Monthly Income (active)" value={show(rupees(income))} tone="blue" />
        <StatCard icon="maintenance" label="Open Maintenance" value={show(openRequests)} tone="blue" />
      </div>

      <div className="flex items-end justify-between mt-8 mb-3">
        <h2 className="text-lg">My Products</h2>
        <Link to="/vendor/products" className="text-sm font-medium text-brand hover:underline">View All →</Link>
      </div>

      {!loading && products.length === 0 && (
        <p className="text-gray-500">
          You have no products yet.{' '}
          <Link to="/vendor/products/new" className="text-brand underline">
            Add your first product
          </Link>
        </p>
      )}

      <div className="space-y-3">
        {products.slice(0, 4).map((p) => (
          <div key={p._id} className="card p-3 flex items-center gap-4">
            {p.images?.[0] ? (
              <img src={p.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-cream-dark flex items-center justify-center font-display text-xl text-brand/60">
                {p.name[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{p.name}</p>
              <p className="text-sm text-gray-600">
                {rupees(p.tenureOptions[0].monthlyRent)} / month &middot; Stock {p.stock}
              </p>
            </div>
            <Link to={`/vendor/products/${p._id}/edit`} className="btn btn-sm">
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}