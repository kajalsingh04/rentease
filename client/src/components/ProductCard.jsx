import { useState } from 'react';
import { Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { rupees } from '../utils/format';
import Icon from './Icon';
import Stars from './Stars';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const plan = product.tenureOptions[0]; // the plan that "Add to Cart" uses (can be changed in the cart)
  const months = product.tenureOptions.map((o) => o.months).join(' / ');
  const outOfStock = product.stock === 0;

  const handleAdd = () => {
    addItem(product, plan);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="card flex flex-col">
      <Link to={`/products/${product._id}`} aria-label={product.name}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt="" loading="lazy" className="h-44 w-full object-cover" />
        ) : (
          <div className="h-44 bg-cream-dark flex items-center justify-center font-display text-5xl text-brand/60">
            {product.name[0]}
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-base hover:text-leaf">{product.name}</h3>
        </Link>
        <p className="text-xs text-gray-500 capitalize mt-0.5">{product.subCategory || product.category}</p>

        {product.ratingCount > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
            <Stars value={product.ratingAverage} size={14} />
            {product.ratingAverage} ({product.ratingCount})
          </p>
        )}

        <p className="mt-2 font-display font-semibold text-xl text-brand">
          {rupees(plan.monthlyRent)}
          <span className="font-sans font-normal text-sm text-gray-600"> / month</span>
        </p>
        <p className="text-xs text-gray-600 mt-0.5">Security Deposit: {rupees(product.securityDeposit)}</p>

        <p className="inline-flex items-center gap-1.5 self-start mt-3 mb-3.5 bg-brand-soft text-brand text-xs rounded-md px-2 py-1">
          <Icon name="calendar" size={13} />
          {months} months
        </p>

        <button onClick={handleAdd} disabled={outOfStock} className="btn btn-sm w-full mt-auto">
          <Icon name="cart" size={16} />
          {outOfStock ? 'Out of stock' : added ? 'Added to cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}