import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import api, { getError } from '../api/axios';
import Icon from '../components/Icon';
import Stars from '../components/Stars';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatDate, rupees } from '../utils/format';

const trust = [
  { icon: 'truck', label: 'Free Delivery' },
  { icon: 'maintenance', label: 'Free Maintenance' },
  { icon: 'returns', label: 'Easy Returns' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState(null); // the rental period that the customer picked
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState('description');
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [added, setAdded] = useState(false);
  const [refresh, setRefresh] = useState(0); // change this number to load the data again

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(getError(err)));
    api
      .get(`/reviews/product/${id}`)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));
  }, [id, refresh]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!product) return <p>Loading...</p>;

  const selected = product.tenureOptions.find((o) => o.months === selectedMonths) || product.tenureOptions[0];
  const images = product.images || [];
  const sellerName = product.vendor?.businessName || product.vendor?.name;

  const handleAdd = () => {
    addItem(product, selected);
    setAdded(true);
  };

  // Add to the cart and go straight to checkout
  const handleRentNow = () => {
    addItem(product, selected);
    navigate('/checkout');
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    setReviewError('');
    try {
      await api.delete(`/reviews/${reviewId}`);
      setRefresh((n) => n + 1);
    } catch (err) {
      setReviewError(getError(err));
    }
  };

  const tabs = [
    ['description', 'Description'],
    ['details', 'Rental details'],
    ['reviews', `Reviews (${product.ratingCount || 0})`],
  ];

  return (
    <div>
      <Link to="/products" className="text-sm text-brand hover:underline">
        ← Back to products
      </Link>

      <div className="grid lg:grid-cols-2 gap-10 mt-4">
        {/* Pictures */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show picture ${i + 1}`}
                  className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 ${
                    i === activeImage ? 'border-brand' : 'border-transparent'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {images.length > 0 ? (
            <img src={images[activeImage] || images[0]} alt={product.name} className="flex-1 min-w-0 rounded-2xl w-full max-h-[460px] object-cover" />
          ) : (
            <div className="flex-1 h-72 bg-cream-dark rounded-2xl flex items-center justify-center font-display text-7xl text-brand/60">
              {product.name[0]}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{product.subCategory || product.category}</p>
          <h1 className="text-3xl mt-1 text-gray-900">{product.name}</h1>
          {sellerName && (
            <p className="text-sm text-gray-600 mt-1">
              Sold by <b>{sellerName}</b>
            </p>
          )}

          <p className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            {product.ratingCount > 0 ? (
              <>
                <Stars value={product.ratingAverage} />
                <b>{product.ratingAverage}</b>
                <button onClick={() => setTab('reviews')} className="underline">
                  ({product.ratingCount} {product.ratingCount === 1 ? 'review' : 'reviews'})
                </button>
              </>
            ) : (
              'No reviews yet'
            )}
          </p>

          <p className="mt-4 font-display font-semibold text-3xl text-brand">
            {rupees(selected.monthlyRent)}
            <span className="font-sans font-normal text-base text-gray-600"> / month</span>
          </p>
          <p className="text-sm text-gray-700 mt-1">
            Security Deposit (refundable): <b>{rupees(product.securityDeposit)}</b>
          </p>

          <h2 className="text-sm font-semibold mt-6 mb-2 font-sans">Select Rental Duration:</h2>
          <div className="flex flex-wrap gap-2">
            {product.tenureOptions.map((o) => (
              <button
                key={o.months}
                onClick={() => setSelectedMonths(o.months)}
                aria-pressed={selected.months === o.months}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  selected.months === o.months
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-brand border-gray-300 hover:border-brand'
                }`}
              >
                {o.months} Months
              </button>
            ))}
          </div>

          {product.stock === 0 ? (
            <p className="mt-6 text-red-600 font-medium">Currently out of stock</p>
          ) : (
            <>
              {product.stock <= 3 && <p className="mt-4 text-sm text-[#a8691f]">Only {product.stock} left</p>}
              <div className="flex flex-wrap gap-3 mt-5">
                <button onClick={handleAdd} className="btn">
                  <Icon name="cart" size={18} />
                  Add to Cart
                </button>
                <button onClick={handleRentNow} className="btn btn-gold">
                  Rent Now
                  <Icon name="arrow" size={18} />
                </button>
              </div>
            </>
          )}

          {added && (
            <p className="mt-3 text-green-700 text-sm">
              Added to cart.{' '}
              <Link to="/cart" className="underline">
                Go to cart
              </Link>
            </p>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-7 text-sm text-gray-700">
            {trust.map((t) => (
              <span key={t.label} className="flex items-center gap-2">
                <Icon name={t.icon} size={18} className="text-brand" />
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <div className="flex gap-6 border-b border-gray-300 text-sm font-medium">
          {tabs.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`pb-2 -mb-px border-b-2 ${
                tab === value ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-brand'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'description' && (
          <p className="mt-4 text-gray-700 max-w-2xl">
            {product.description || 'No description added for this product yet.'}
          </p>
        )}

        {tab === 'details' && (
          <div className="mt-4 card max-w-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Rent per month</th>
                  <th className="p-3">Total rent</th>
                </tr>
              </thead>
              <tbody>
                {product.tenureOptions.map((o) => (
                  <tr key={o.months} className="border-t border-gray-100">
                    <td className="p-3">{o.months} months</td>
                    <td className="p-3">{rupees(o.monthlyRent)}</td>
                    <td className="p-3">{rupees(o.monthlyRent * o.months)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="p-3 text-sm text-gray-600 border-t border-gray-100">
              Refundable security deposit: {rupees(product.securityDeposit)}. Available units: {product.stock}.
            </p>
            {product.vendor?.servicesOffered && (
              <p className="p-3 text-sm text-gray-600 border-t border-gray-100">
                About the vendor: {product.vendor.servicesOffered}
              </p>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="mt-4 max-w-2xl space-y-3">
            {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
            {reviews.length === 0 && (
              <p className="text-gray-500">No reviews yet. After you rent this product, you can rate it in My Rentals.</p>
            )}

            {reviews.map((r) => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Stars value={r.rating} size={14} />
                    <span className="text-sm font-medium">{r.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-700 mt-2">{r.comment}</p>}
                {user && (user.role === 'admin' || user.id === r.userId) && (
                  <button onClick={() => deleteReview(r._id)} className="text-xs text-red-600 hover:underline mt-2">
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}