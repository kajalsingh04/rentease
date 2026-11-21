import { useState } from 'react';
import { Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { rupees } from '../utils/format';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const plan = product.tenureOptions[0]; // the plan that "Add to Cart" uses (can be changed in the cart)
  const months = product.tenureOptions.map((o) => o.months).join(', ');
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
          <img src={product.images[0]} alt="" loading="lazy" className="h-[170px] w-full object-cover" />
        ) : (
          <div className="h-[170px] bg-brand-soft flex items-center justify-center font-display text-5xl text-brand">
            {product.name[0]}
          </div>
        )}
      </Link>

      <div className="p-[18px] flex flex-col flex-1">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-[17px] hover:text-brand">{product.name}</h3>
        </Link>
        <p className="text-[13px] text-gray-600 my-1.5 capitalize">
          {product.subCategory || product.category} · {months} months
        </p>
        <p className="font-display font-semibold text-lg mt-2 mb-3.5">
          {rupees(plan.monthlyRent)} / month
          <span className="font-sans font-normal text-xs text-gray-500"> for {plan.months} months</span>
        </p>

        <button onClick={handleAdd} disabled={outOfStock} className="btn w-full mt-auto">
          {outOfStock ? 'Out of stock' : added ? 'Added to cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}