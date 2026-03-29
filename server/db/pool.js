const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

// Default empty database structure
const defaultData = {
  users: [],
  categories: [],
  products: [],
  product_images: [],
  cart_items: [],
  orders: [],
  order_items: [],
  counters: {
    users: 0,
    categories: 0,
    products: 0,
    product_images: 0,
    cart_items: 0,
    orders: 0,
    order_items: 0,
  }
};

class Database {
  constructor() {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      this.data = JSON.parse(raw);
    } else {
      this.data = JSON.parse(JSON.stringify(defaultData));
    }
    console.log('📦 Database loaded');
  }

  save() {
    fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
  }

  // Get next ID for a table
  nextId(table) {
    this.data.counters[table]++;
    return this.data.counters[table];
  }

  // --- Users ---
  getUser(id) {
    return this.data.users.find(u => u.id === id);
  }

  // --- Categories ---
  getAllCategories() {
    return this.data.categories.map(c => ({
      ...c,
      product_count: this.data.products.filter(p => p.category_id === c.id).length,
    }));
  }

  // --- Products ---
  getAllProducts({ search, category, sort } = {}) {
    let products = [...this.data.products];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (category) {
      const cat = this.data.categories.find(c => c.slug === category);
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
      default:
        products.sort((a, b) => b.review_count - a.review_count);
    }

    // Add category info and first image
    return products.map(p => {
      const cat = this.data.categories.find(c => c.id === p.category_id);
      const images = this.data.product_images
        .filter(i => i.product_id === p.id)
        .sort((a, b) => a.display_order - b.display_order);
      return {
        ...p,
        category_name: cat ? cat.name : null,
        category_slug: cat ? cat.slug : null,
        image_url: images.length > 0 ? images[0].image_url : null,
      };
    });
  }

  getProduct(id) {
    const p = this.data.products.find(prod => prod.id === id);
    if (!p) return null;

    const cat = this.data.categories.find(c => c.id === p.category_id);
    const images = this.data.product_images
      .filter(i => i.product_id === p.id)
      .sort((a, b) => a.display_order - b.display_order);

    return {
      ...p,
      category_name: cat ? cat.name : null,
      category_slug: cat ? cat.slug : null,
      images,
    };
  }

  // --- Cart ---
  getCart(userId) {
    const items = this.data.cart_items
      .filter(ci => ci.user_id === userId)
      .sort((a, b) => new Date(b.added_at) - new Date(a.added_at))
      .map(ci => {
        const p = this.data.products.find(prod => prod.id === ci.product_id);
        const images = this.data.product_images
          .filter(i => i.product_id === ci.product_id)
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
  }

  addToCart(userId, productId, quantity = 1) {
    const product = this.data.products.find(p => p.id === productId);
    if (!product) throw { statusCode: 404, message: 'Product not found' };

    const existing = this.data.cart_items.find(
      ci => ci.user_id === userId && ci.product_id === productId
    );

    const newQty = existing ? existing.quantity + quantity : quantity;
    if (newQty > product.stock) {
      throw { statusCode: 400, message: 'Not enough stock available' };
    }

    if (existing) {
      existing.quantity = newQty;
      existing.added_at = new Date().toISOString();
      this.save();
      return existing;
    } else {
      const item = {
        id: this.nextId('cart_items'),
        user_id: userId,
        product_id: productId,
        quantity,
        added_at: new Date().toISOString(),
      };
      this.data.cart_items.push(item);
      this.save();
      return item;
    }
  }

  updateCartItem(id, userId, quantity) {
    const ci = this.data.cart_items.find(item => item.id === id && item.user_id === userId);
    if (!ci) throw { statusCode: 404, message: 'Cart item not found' };

    const product = this.data.products.find(p => p.id === ci.product_id);
    if (quantity > product.stock) {
      throw { statusCode: 400, message: 'Not enough stock available' };
    }

    ci.quantity = quantity;
    this.save();
    return ci;
  }

  removeFromCart(id, userId) {
    const index = this.data.cart_items.findIndex(item => item.id === id && item.user_id === userId);
    if (index === -1) throw { statusCode: 404, message: 'Cart item not found' };
    this.data.cart_items.splice(index, 1);
    this.save();
  }

  // --- Orders ---
  placeOrder(userId, shippingInfo) {
    const cartItems = this.data.cart_items.filter(ci => ci.user_id === userId);
    if (cartItems.length === 0) {
      throw { statusCode: 400, message: 'Cart is empty' };
    }

    // Validate stock
    const itemsWithProducts = cartItems.map(ci => {
      const p = this.data.products.find(prod => prod.id === ci.product_id);
      if (ci.quantity > p.stock) {
        throw { statusCode: 400, message: `Not enough stock for "${p.name}". Available: ${p.stock}` };
      }
      return { ...ci, product: p };
    });

    // Calculate total
    const totalAmount = itemsWithProducts.reduce(
      (sum, item) => sum + (item.product.price * item.quantity), 0
    );

    // Create order
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `AMZ-${timestamp}-${random}`;

    const order = {
      id: this.nextId('orders'),
      user_id: userId,
      order_number: orderNumber,
      total_amount: parseFloat(totalAmount.toFixed(2)),
      status: 'Placed',
      ...shippingInfo,
      created_at: new Date().toISOString(),
    };
    this.data.orders.push(order);

    // Create order items and update stock
    const orderItems = [];
    for (const item of itemsWithProducts) {
      const oi = {
        id: this.nextId('order_items'),
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.product.price,
      };
      this.data.order_items.push(oi);
      orderItems.push({
        product_id: item.product_id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      });

      // Update stock
      item.product.stock -= item.quantity;
    }

    // Clear cart
    this.data.cart_items = this.data.cart_items.filter(ci => ci.user_id !== userId);

    this.save();

    return { order, items: orderItems };
  }

  getOrders(userId) {
    const orders = this.data.orders
      .filter(o => o.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return orders.map(order => ({
      ...order,
      items: this.data.order_items
        .filter(oi => oi.order_id === order.id)
        .map(oi => {
          const p = this.data.products.find(prod => prod.id === oi.product_id);
          const images = this.data.product_images
            .filter(i => i.product_id === oi.product_id)
            .sort((a, b) => a.display_order - b.display_order);
          return {
            ...oi,
            product_name: p ? p.name : 'Unknown Product',
            image_url: images.length > 0 ? images[0].image_url : null,
          };
        }),
    }));
  }

  getOrder(id, userId) {
    const order = this.data.orders.find(o => o.id === id && o.user_id === userId);
    if (!order) return null;

    const items = this.data.order_items
      .filter(oi => oi.order_id === order.id)
      .map(oi => {
        const p = this.data.products.find(prod => prod.id === oi.product_id);
        const images = this.data.product_images
          .filter(i => i.product_id === oi.product_id)
          .sort((a, b) => a.display_order - b.display_order);
        return {
          ...oi,
          product_name: p ? p.name : 'Unknown Product',
          image_url: images.length > 0 ? images[0].image_url : null,
        };
      });

    return { ...order, items };
  }
}

const db = new Database();
module.exports = db;
