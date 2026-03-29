const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(error.error?.message || 'Request failed');
  }

  return response.json();
}

// Products
export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/products${query ? `?${query}` : ''}`);
};

export const getProduct = (id) => request(`/products/${id}`);

// Categories
export const getCategories = () => request('/categories');

// Cart
export const getCart = () => request('/cart');

export const addToCart = (product_id, quantity = 1) =>
  request('/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id, quantity }),
  });

export const updateCartItem = (id, quantity) =>
  request(`/cart/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });

export const removeFromCart = (id) =>
  request(`/cart/${id}`, {
    method: 'DELETE',
  });

// Orders
export const placeOrder = (shippingInfo) =>
  request('/orders', {
    method: 'POST',
    body: JSON.stringify(shippingInfo),
  });

export const getOrders = () => request('/orders');

export const getOrder = (id) => request(`/orders/${id}`);
