import { useEffect, useState } from 'react';
import api, { getError } from '../api/axios';
import ProductCard from '../components/ProductCard';

const categories = [
  { value: '', label: 'All' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'appliance', label: 'Appliances' },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [searchText, setSearchText] = useState(''); // what the user is typing
  const [search, setSearch] = useState(''); // what we send to the API
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load products again when category, search or page changes
  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get('/products', { params: { category, search, page, limit: 12 } })
      .then((res) => {
        setProducts(res.data.items);
        setPages(res.data.pages);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [category, search, page]);

  const changeCategory = (value) => {
    setCategory(value);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchText);
    setPage(1);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Rent furniture and appliances</h1>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6">
        <div className="flex gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => changeCategory(c.value)}
              className={`px-4 py-1.5 rounded-full text-sm border ${
                category === c.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white border-gray-300 hover:border-indigo-400'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search products..."
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
          <button className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm">Search</button>
        </form>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && products.length === 0 && <p className="text-gray-500">No products found.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {page} of {pages}
          </span>
          <button
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}