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
    <div className="grid md:grid-cols-2 gap-8">
      {product.images?.[0] ? (
        <img src={product.images[0]} alt={product.name} className="rounded-xl w-full object-cover" />
      ) : (
        <div className="h-64 md:h-full bg-indigo-50 rounded-xl flex items-center justify-center text-7xl text-indigo-300">
          {product.name[0]}
        </div>
      )}

      <div>
        <p className="text-xs uppercase text-gray-400">{product.subCategory || product.category}</p>
        <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
        {product.description && <p className="text-gray-600 mt-3">{product.description}</p>}

        <h2 className="font-semibold mt-6 mb-2">Choose rental time</h2>
        <div className="space-y-2">
          {product.tenureOptions.map((o) => (
            <label
              key={o.months}
              className={`flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer ${
                selected?.months === o.months ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="tenure"
                  checked={selected?.months === o.months}
                  onChange={() => setSelected(o)}
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
          <button
            onClick={handleAdd}
            className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
          >
            Add to cart
          </button>
        )}

        {added && (
          <p className="mt-3 text-green-600 text-sm">
            Added to cart.{' '}
            <Link to="/cart" className="underline">
              Go to cart
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}