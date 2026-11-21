import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import api, { getError } from '../../api/axios';
import { rupees } from '../../utils/format';

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api
      .get('/products/mine')
      .then((res) => setProducts(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [refresh]);

  const reload = () => setRefresh((n) => n + 1);

  // Hide or show a product in the shop
  const toggleActive = async (p) => {
    try {
      await api.put(`/products/${p._id}`, { isActive: !p.isActive });
      reload();
    } catch (err) {
      setError(getError(err));
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      reload();
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My products</h2>
        <Link to="/vendor/products/new" className="bg-accent text-white text-sm px-4 py-2 rounded-lg hover:bg-accent-dark">
          Add product
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}
      {!loading && products.length === 0 && <p className="text-gray-500">You have no products yet.</p>}

      {products.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Deposit</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-gray-100">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 capitalize">{p.subCategory || p.category}</td>
                  <td className="p-3">{rupees(p.securityDeposit)}</td>
                  <td className={`p-3 ${p.stock === 0 ? 'text-red-600 font-medium' : ''}`}>{p.stock}</td>
                  <td className="p-3">{p.isActive ? 'Visible' : 'Hidden'}</td>
                  <td className="p-3 whitespace-nowrap space-x-3">
                    <Link to={`/vendor/products/${p._id}/edit`} className="text-brand hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => toggleActive(p)} className="text-gray-600 hover:underline">
                      {p.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => remove(p)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}