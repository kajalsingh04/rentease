import { Link } from 'react-router';
import { rupees } from '../utils/format';

export default function ProductCard({ product }) {
  // Lowest monthly rent among all tenure options
  const fromRent = Math.min(...product.tenureOptions.map((o) => o.monthlyRent));

  return (
    <Link
      to={`/products/${product._id}`}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition"
    >
      {product.images?.[0] ? (
        <img src={product.images[0]} alt={product.name} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 bg-indigo-50 flex items-center justify-center text-4xl text-indigo-300">
          {product.name[0]}
        </div>
      )}

      <div className="p-4">
        <p className="text-xs uppercase text-gray-400">{product.subCategory || product.category}</p>
        <h3 className="font-semibold mt-1">{product.name}</h3>
        <p className="mt-2 text-indigo-600 font-bold">
          From {rupees(fromRent)}
          <span className="text-sm font-normal text-gray-500">/month</span>
        </p>
        {product.stock === 0 && <p className="text-sm text-red-500 mt-1">Out of stock</p>}
      </div>
    </Link>
  );
}