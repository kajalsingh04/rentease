import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import api, { getError } from '../api/axios';
import ProductCard from '../components/ProductCard';

// The "type" must match the Type that the vendor writes when adding a product
const categories = [
  { label: 'Beds', type: 'bed' },
  { label: 'Sofas', type: 'sofa' },
  { label: 'Refrigerators', type: 'fridge' },
  { label: 'Washing Machines', type: 'washing machine' },
];

const steps = [
  { title: '1. Choose', text: 'Pick your furniture or appliance and a rental period.' },
  { title: '2. Pay monthly', text: 'Pay a small amount each month, with no big upfront cost.' },
  { title: '3. Enjoy', text: 'We deliver, set up and maintain it. Return it when you are done.' },
];

export default function Home() {
  const { hash } = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Newest 4 products
  useEffect(() => {
    api
      .get('/products', { params: { limit: 4 } })
      .then((res) => setProducts(res.data.items))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, []);

  // Menu link "How it works" (/#how-it-works) scrolls to that section
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand text-white">
        <div className="wrap py-[72px] flex flex-wrap items-center gap-10">
          <div className="flex-1 min-w-[300px]">
            <h1 className="text-4xl md:text-[46px] leading-[1.15]">Rent furniture and appliances, pay monthly</h1>
            <p className="text-lg leading-relaxed mt-[18px] mb-7 text-[#e6f4f2]">
              Free delivery, free maintenance and easy returns. Furnish your home without a big upfront cost.
            </p>
            <Link to="/products" className="btn">Browse Products</Link>
          </div>

          {/* Picture. To use your own photo, replace this block with: <img src="/hero.jpg" alt="" className="..."/> */}
          <div className="flex-1 min-w-[300px] h-[300px] rounded-3xl bg-[#14b8a6] flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 480 300" className="w-full h-full" aria-hidden="true">
              <rect x="0" y="236" width="480" height="64" fill="#0f9b8e" />
              {/* plant */}
              <ellipse cx="62" cy="150" rx="16" ry="44" fill="#0b5f58" transform="rotate(-18 62 150)" />
              <ellipse cx="84" cy="146" rx="14" ry="40" fill="#0f766e" transform="rotate(14 84 146)" />
              <rect x="50" y="190" width="44" height="46" rx="8" fill="#c2410c" />
              {/* sofa */}
              <rect x="130" y="124" width="236" height="84" rx="24" fill="#0f766e" />
              <rect x="112" y="170" width="272" height="62" rx="22" fill="#0b5f58" />
              <rect x="112" y="150" width="44" height="82" rx="20" fill="#0f766e" />
              <rect x="340" y="150" width="44" height="82" rx="20" fill="#0f766e" />
              <rect x="170" y="140" width="46" height="46" rx="10" fill="#c2410c" />
              <rect x="136" y="232" width="10" height="14" rx="3" fill="#053f3a" />
              <rect x="350" y="232" width="10" height="14" rx="3" fill="#053f3a" />
              {/* lamp */}
              <rect x="424" y="90" width="4" height="146" fill="#053f3a" />
              <path d="M404 92 L448 92 L438 58 L414 58 Z" fill="#cce7e3" />
              <rect x="412" y="234" width="28" height="6" rx="3" fill="#053f3a" />
            </svg>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="wrap pt-14">
        <h2 className="text-[28px] mb-6">Shop by category</h2>
        <div className="grid4">
          {categories.map((c) => (
            <Link
              key={c.type}
              to={`/products?subCategory=${encodeURIComponent(c.type)}`}
              className="card p-7 text-center font-medium hover:text-brand hover:shadow-md transition"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="wrap pt-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-[28px]">Popular products</h2>
          <Link to="/products" className="text-brand font-medium hover:underline">View all</Link>
        </div>

        {loading && <p>Loading products...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && products.length === 0 && <p className="text-gray-500">No products yet.</p>}

        <div className="grid4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="wrap pt-14 scroll-mt-4">
        <h2 className="text-[28px] mb-6">How it works</h2>
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {steps.map((s) => (
            <div key={s.title} className="card p-7">
              <h3 className="text-xl text-brand">{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-gray-600 mt-2">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}