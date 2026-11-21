import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import api, { getError } from '../api/axios';
import ProductCard from '../components/ProductCard';

const categories = [
  { value: '', label: 'All' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'appliance', label: 'Appliances' },
];

export default function Products() {
  // The filters live in the address bar, like /products?category=furniture&search=bed
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const subCategory = params.get('subCategory') || '';
  const search = params.get('search') || '';
  const page = Number(params.get('page')) || 1;

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load products again when a filter or the page changes
  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get('/products', { params: { category, subCategory, search, page, limit: 12 } })
      .then((res) => {
        setProducts(res.data.items);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [category, subCategory, search, page]);

  // Change some filters and keep the others. The page goes back to 1.
  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '', ...changes }).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get('q') || '').trim();
    update({ search: q });
  };

  const filters = [
    subCategory && { label: `Type: ${subCategory}`, clear: { subCategory: '' } },
    search && { label: `Search: ${search}`, clear: { search: '' } },
  ].filter(Boolean);

  return (
    <div>
      <h1 className="text-[28px] mb-5">Browse products</h1>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => update({ category: c.value, subCategory: '' })}
              className={`px-4 py-1.5 rounded-full text-sm border ${
                category === c.value
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white border-gray-300 hover:border-brand'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* key makes the box show the new text when the search changes from the header */}
        <form key={search} onSubmit={handleSearch} role="search" className="flex gap-2">
          <label htmlFor="page-search" className="sr-only">Search products</label>
          <input
            id="page-search"
            name="q"
            defaultValue={search}
            placeholder="Search products..."
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white"
          />
          <button className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm">Search</button>
        </form>
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => update(f.clear)}
              className="bg-brand-soft text-brand rounded-full px-3 py-1 capitalize"
            >
              {f.label} ✕
            </button>
          ))}
        </div>
      )}

      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <p className="text-sm text-gray-500 mb-4">
          {total} {total === 1 ? 'product' : 'products'} found
        </p>
      )}

      <div className="grid4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => update({ page: String(page - 1) })}
            className="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {page} of {pages}
          </span>
          <button
            disabled={page === pages}
            onClick={() => update({ page: String(page + 1) })}
            className="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}