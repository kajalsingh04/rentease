import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import api, { getError } from '../api/axios';
import { useCart } from '../context/CartContext';
import { rupees } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [selected, setSelected] = useState(null); // selected tenure option
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setSelected(res.data.tenureOptions[0]);
      })
      .catch((err) => setError(getError(err)));
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!product) return <p>Loading...</p>;

  const handleAdd = () => {
    addItem(product, selected);
    setAdded(true);
  };

  return (
    <div>
      <Link to="/products" className="text-sm text-brand hover:underline">
        ← Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mt-4">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="rounded-2xl w-full object-cover" />
        ) : (
          <div className="h-64 md:h-full min-h-64 bg-brand-soft rounded-2xl flex items-center justify-center font-display text-7xl text-brand">
            {product.name[0]}
          </div>
        )}

        <div>
          <p className="text-xs uppercase text-gray-500">{product.subCategory || product.category}</p>
          <h1 className="text-3xl mt-1">{product.name}</h1>
          {product.description && <p className="text-gray-600 mt-3">{product.description}</p>}

          <h2 className="text-lg mt-6 mb-2">Choose rental time</h2>
          <div className="space-y-2">
            {product.tenureOptions.map((o) => (
              <label
                key={o.months}
                className={`flex items-center justify-between border rounded-xl px-4 py-3 cursor-pointer bg-white ${
                  selected?.months === o.months ? 'border-brand ring-1 ring-brand' : 'border-gray-300'
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="tenure"
                    checked={selected?.months === o.months}
                    onChange={() => setSelected(o)}
                    className="accent-[#0f766e]"
                  />
                  {o.months} months
                </span>
                <span className="font-semibold">{rupees(o.monthlyRent)} / month</span>
              </label>
            ))}
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Security deposit (refundable): <b>{rupees(product.securityDeposit)}</b>
          </p>

          {product.stock === 0 ? (
            <p className="mt-6 text-red-600 font-medium">Currently out of stock</p>
          ) : (
            <button onClick={handleAdd} className="btn w-full mt-6">
              Add to Cart
            </button>
          )}

          {added && (
            <p className="mt-3 text-green-700 text-sm">
              Added to cart.{' '}
              <Link to="/cart" className="underline">
                Go to cart
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}