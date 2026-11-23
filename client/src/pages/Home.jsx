import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import api, { getError } from '../api/axios';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';

// To use your own photo: put it in the "public" folder and write its name here, like '/hero.jpg'
const HERO_PHOTO = '../public/herobanner.jpg';

// The "type" must match the Type that the vendor writes when adding a product
const categories = [
  { label: 'Sofas', type: 'sofa', icon: 'sofa' },
  { label: 'Beds', type: 'bed', icon: 'bed' },
  { label: 'Tables', type: 'table', icon: 'table' },
  { label: 'Chairs', type: 'chair', icon: 'chair' },
  { label: 'Refrigerators', type: 'fridge', icon: 'fridge' },
  { label: 'Washing Machines', type: 'washing machine', icon: 'washer' },
];

const features = [
  { icon: 'calendar', label: 'Flexible Rentals' },
  { icon: 'products', label: 'Affordable Prices' },
  { icon: 'returns', label: 'Easy Returns' },
];

const steps = [
  { icon: 'dashboard', title: '1. Browse Products', text: 'Explore our wide range' },
  { icon: 'calendar', title: '2. Choose Plan', text: 'Pick your rental duration' },
  { icon: 'home', title: '3. Enjoy at Home', text: 'Get it delivered easily' },
];

const reasons = ['Affordable Rentals', 'Flexible Plans', 'Hassle-Free Returns'];

function HeroPicture() {
  if (HERO_PHOTO) {
    return <img src={HERO_PHOTO} alt="" className="w-full h-full object-cover" />;
  }
  // A simple drawing, until you add a photo
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full" aria-hidden="true">
      <rect width="480" height="320" fill="#efe6d6" />
      <rect x="0" y="246" width="480" height="74" fill="#e4d6bd" />
      <rect x="296" y="40" width="104" height="132" rx="6" fill="#f7f2e8" stroke="#d9c9a8" strokeWidth="4" />
      <ellipse cx="348" cy="106" rx="26" ry="34" fill="#2f6b4f" />
      {/* plant */}
      <ellipse cx="66" cy="160" rx="16" ry="48" fill="#243b35" transform="rotate(-18 66 160)" />
      <ellipse cx="90" cy="156" rx="14" ry="44" fill="#2f6b4f" transform="rotate(14 90 156)" />
      <rect x="52" y="200" width="46" height="48" rx="8" fill="#d9a66f" />
      {/* sofa */}
      <rect x="130" y="132" width="236" height="86" rx="26" fill="#243b35" />
      <rect x="112" y="178" width="272" height="62" rx="22" fill="#1a2b26" />
      <rect x="112" y="158" width="44" height="82" rx="20" fill="#243b35" />
      <rect x="340" y="158" width="44" height="82" rx="20" fill="#243b35" />
      <rect x="170" y="148" width="46" height="46" rx="10" fill="#d9a66f" />
      <rect x="136" y="240" width="10" height="14" rx="3" fill="#111d19" />
      <rect x="350" y="240" width="10" height="14" rx="3" fill="#111d19" />
      {/* lamp */}
      <rect x="432" y="98" width="4" height="148" fill="#243b35" />
      <path d="M412 100 L456 100 L446 66 L422 66 Z" fill="#d9a66f" />
      <rect x="420" y="244" width="28" height="6" rx="3" fill="#243b35" />
    </svg>
  );
}

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

  // Menu links like /#about and /#contact scroll to that part of the page
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cream to-cream-dark/60">
        <div className="wrap pt-12 pb-8 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl leading-[1.1] text-gray-900">
              Make Your Space
              <span className="block text-leaf">Feel Like Home.</span>
            </h1>
            <p className="text-lg text-gray-600 mt-4 mb-7 max-w-md">
              Rent furniture and appliances without spending a fortune.
            </p>
            <Link to="/products" className="btn btn-gold">
              Explore Products
              <Icon name="arrow" size={18} />
            </Link>
          </div>

          <div className="h-[280px] md:h-[340px] rounded-3xl overflow-hidden shadow-sm">
            <HeroPicture />
          </div>
        </div>

        <div className="wrap pb-8 flex flex-wrap gap-x-10 gap-y-3 text-sm font-medium text-brand">
          {features.map((f) => (
            <span key={f.label} className="flex items-center gap-2">
              <Icon name={f.icon} size={20} />
              {f.label}
            </span>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="wrap pt-10">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl">Browse by Category</h2>
          <Link to="/products" className="text-sm font-medium text-brand hover:underline">View All →</Link>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.type}
              to={`/products?subCategory=${encodeURIComponent(c.type)}`}
              className="card py-6 px-3 flex flex-col items-center gap-3 text-sm font-medium text-center text-brand hover:shadow-md transition"
            >
              <span className="w-14 h-14 rounded-2xl bg-cream flex items-center justify-center">
                <Icon name={c.icon} size={30} />
              </span>
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="wrap pt-12">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl">Popular Products</h2>
          <Link to="/products" className="text-sm font-medium text-brand hover:underline">View All →</Link>
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

      {/* How it works + Why choose */}
      <section id="about" className="wrap pt-12 scroll-mt-4 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card p-6">
          <h2 className="text-xl mb-6">How RentEase Works?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.title} className="flex sm:flex-col items-center sm:text-center gap-3">
                <span className="w-14 h-14 rounded-full bg-brand-soft text-brand flex items-center justify-center shrink-0">
                  <Icon name={s.icon} size={26} />
                </span>
                <div>
                  <p className="font-semibold text-sm">{s.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl bg-brand text-white p-6">
          <h2 className="text-xl mb-4">Why Choose RentEase?</h2>
          <ul className="space-y-3">
            {reasons.map((r) => (
              <li key={r} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-gold text-brand flex items-center justify-center shrink-0">
                  <Icon name="check" size={14} />
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}