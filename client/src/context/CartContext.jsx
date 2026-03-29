import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeFromCart as apiRemoveFromCart } from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: '0.00', itemCount: 0 });
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      await apiAddToCart(productId, quantity);
      await fetchCart();
      showToast('Added to cart!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await apiUpdateCartItem(cartItemId, quantity);
      await fetchCart();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await apiRemoveFromCart(cartItemId);
      await fetchCart();
      showToast('Item removed from cart');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const clearCartLocal = () => {
    setCart({ items: [], subtotal: '0.00', itemCount: 0 });
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      toasts,
      addToCart,
      updateQuantity,
      removeItem,
      fetchCart,
      clearCartLocal,
      showToast,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
