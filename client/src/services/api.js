import dbData from '../data/data.json';

// Utility for delays to simulate network requests
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const getStorage = (key, defaultVal) => {
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : defaultVal;
};

const setStorage = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

const DEFAULT_USER_ID = 1;

// --- Products ---
export const getProducts = async (params = {}) => {
  await delay();
  const { search, category, sort } = params;
  let products = [...dbData.products];

  // Filters
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (category) {
    const cat = dbData.categories.find(c => c.slug === category);
    if (cat) {
      products = products.filter(p => p.category_id === cat.id);
    }
  }

  // Sort
  switch (sort) {
    case 'price_asc':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      products.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    default: // popularity/reviews
      products.sort((a, b) => b.review_count - a.review_count);
  }

  // Map category info & first image
  return products.map(p => {
    const cat = dbData.categories.find(c => c.id === p.category_id);
    const images = dbData.product_images
      .filter(i => i.product_id === p.id)
      .sort((a, b) => a.display_order - b.display_order);
    return {
      ...p,
      category_name: cat ? cat.name : null,
      category_slug: cat ? cat.slug : null,
      image_url: images.length > 0 ? images[0].image_url : null,
    };
  });
};

export const getProduct = async (id) => {
  await delay();
  const p = dbData.products.find(prod => prod.id === parseInt(id));
  if (!p) throw new Error('Product not found');

  const cat = dbData.categories.find(c => c.id === p.category_id);
  const images = dbData.product_images
    .filter(i => i.product_id === p.id)
    .sort((a, b) => a.display_order - b.display_order);

  return {
    ...p,
    category_name: cat ? cat.name : null,
    category_slug: cat ? cat.slug : null,
    images: images,
  };
};

// --- Categories ---
export const getCategories = async () => {
  await delay(100);
  return dbData.categories.map(c => ({
    ...c,
    product_count: dbData.products.filter(p => p.category_id === c.id).length,
  }));
};

// --- Cart ---
export const getCart = async () => {
  await delay();
  const cartItems = getStorage('amazon_cart_items', []);

  const items = cartItems.map(ci => {
    const p = dbData.products.find(prod => prod.id === ci.product_id);
    const images = dbData.product_images
      .filter(i => i.product_id === p.id)
      .sort((a, b) => a.display_order - b.display_order);
    return {
      id: ci.id,
      quantity: ci.quantity,
      added_at: ci.added_at,
      product_id: p.id,
      name: p.name,
      price: p.price,
      original_price: p.original_price,
      stock: p.stock,
      image_url: images.length > 0 ? images[0].image_url : null,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return {
    items,
    subtotal: subtotal.toFixed(2),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

export const addToCart = async (product_id, quantity = 1) => {
  await delay();
  const cartItems = getStorage('amazon_cart_items', []);
  const product = dbData.products.find(p => p.id === parseInt(product_id));
  
  if (!product) throw new Error('Product not found');

  const existing = cartItems.find(ci => ci.product_id === product.id);
  const newQty = existing ? existing.quantity + quantity : quantity;
  
  if (newQty > product.stock) throw new Error('Not enough stock available');

  if (existing) {
    existing.quantity = newQty;
    existing.added_at = new Date().toISOString();
  } else {
    cartItems.push({
      id: Date.now(),
      product_id: product.id,
      quantity,
      added_at: new Date().toISOString(),
    });
  }

  setStorage('amazon_cart_items', cartItems);
  return cartItems;
};

export const updateCartItem = async (id, quantity) => {
  await delay();
  const cartItems = getStorage('amazon_cart_items', []);
  const ci = cartItems.find(item => item.id === parseInt(id));
  if (!ci) throw new Error('Cart item not found');

  const product = dbData.products.find(p => p.id === ci.product_id);
  if (quantity > product.stock) throw new Error('Not enough stock available');

  ci.quantity = quantity;
  setStorage('amazon_cart_items', cartItems);
  return ci;
};

export const removeFromCart = async (id) => {
  await delay();
  let cartItems = getStorage('amazon_cart_items', []);
  cartItems = cartItems.filter(item => item.id !== parseInt(id));
  setStorage('amazon_cart_items', cartItems);
  return { message: 'Item removed from cart' };
};

// --- Orders ---
export const placeOrder = async (shippingInfo) => {
  await delay();
  const cartItems = getStorage('amazon_cart_items', []);
  if (cartItems.length === 0) throw new Error('Cart is empty');

  const itemsWithProducts = cartItems.map(ci => {
    const p = dbData.products.find(prod => prod.id === ci.product_id);
    if (ci.quantity > p.stock) throw new Error(`Not enough stock for "${p.name}"`);
    return { ...ci, product: p };
  });

  const totalAmount = itemsWithProducts.reduce(
    (sum, item) => sum + (item.product.price * item.quantity), 0
  );

  const timestamp = Date.now().toString(36).toUpperCase();
  const orderNumber = `AMZ-${timestamp}`;

  const order = {
    id: Date.now(),
    order_number: orderNumber,
    total_amount: parseFloat(totalAmount.toFixed(2)),
    status: 'Placed',
    ...shippingInfo,
    created_at: new Date().toISOString(),
  };

  const orderItemsInfo = itemsWithProducts.map(item => ({
    id: Date.now() + Math.random(),
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.product.price,
    product_name: item.product.name,
    image_url: dbData.product_images.find(i => i.product_id === item.product_id)?.image_url || null
  }));

  const orders = getStorage('amazon_orders', []);
  const orderItemsData = getStorage('amazon_order_items', []);
  
  orders.push(order);
  orderItemsData.push(...orderItemsInfo);

  setStorage('amazon_orders', orders);
  setStorage('amazon_order_items', orderItemsData);

  // Clear cart
  setStorage('amazon_cart_items', []);

  return { order, items: orderItemsInfo };
};

export const getOrders = async () => {
  await delay();
  const orders = getStorage('amazon_orders', []);
  const orderItems = getStorage('amazon_order_items', []);

  const results = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return results.map(order => ({
    ...order,
    items: orderItems.filter(oi => oi.order_id === order.id)
  }));
};

export const getOrder = async (id) => {
  await delay();
  const orders = getStorage('amazon_orders', []);
  const orderItems = getStorage('amazon_order_items', []);

  const order = orders.find(o => o.id === parseInt(id));
  if (!order) throw new Error('Order not found');

  return {
    ...order,
    items: orderItems.filter(oi => oi.order_id === order.id)
  };
};
