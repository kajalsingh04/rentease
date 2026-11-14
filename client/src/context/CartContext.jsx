import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  // Save the cart in the browser, so it stays after refresh
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // One item per product. If it is added again, the tenure is replaced.
  const addItem = (product, option) => {
    setItems((prev) => [
      ...prev.filter((i) => i.productId !== product._id),
      {
        productId: product._id,
        name: product.name,
        image: product.images?.[0],
        tenureMonths: option.months,
        monthlyRent: option.monthlyRent,
        securityDeposit: product.securityDeposit,
      },
    ]);
  };

  const removeItem = (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId));
  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);