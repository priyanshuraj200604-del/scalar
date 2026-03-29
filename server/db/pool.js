const { Pool } = require('pg');

// Use Render's DATABASE_URL if available, otherwise fallback to local .env configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false // Render requires SSL for external connections
});

class Database {
  async query(text, params) {
    const client = await pool.connect();
    try {
      const res = await client.query(text, params);
      return res;
    } finally {
      client.release();
    }
  }

  // --- Categories ---
  async getAllCategories() {
    const res = await this.query(`
      SELECT c.*, COUNT(p.id) as product_count 
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.id
    `);
    return res.rows;
  }

  // --- Products ---
  async getAllProducts({ search, category, sort } = {}) {
    let queryArgs = [];
    let whereClauses = [];

    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, 
             (SELECT image_url FROM product_images i WHERE i.product_id = p.id ORDER BY display_order LIMIT 1) as image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;

    if (search) {
      whereClauses.push(`(p.name ILIKE $${queryArgs.length + 1} OR p.description ILIKE $${queryArgs.length + 1})`);
      queryArgs.push(`%${search}%`);
    }

    if (category) {
      whereClauses.push(`c.slug = $${queryArgs.length + 1}`);
      queryArgs.push(category);
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ` + whereClauses.join(' AND ');
    }

    switch (sort) {
      case 'price_asc':
        sql += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        sql += ` ORDER BY p.price DESC`;
        break;
      case 'rating':
        sql += ` ORDER BY p.rating DESC`;
        break;
      case 'newest':
        sql += ` ORDER BY p.created_at DESC`;
        break;
      default:
        sql += ` ORDER BY p.review_count DESC`;
    }

    const res = await this.query(sql, queryArgs);
    return res.rows.map(row => ({
      ...row,
      price: parseFloat(row.price),
      original_price: row.original_price ? parseFloat(row.original_price) : null,
      rating: parseFloat(row.rating)
    }));
  }

  async getProduct(id) {
    const pRes = await this.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (pRes.rows.length === 0) return null;

    const imgRes = await this.query(`
      SELECT id, image_url, display_order 
      FROM product_images 
      WHERE product_id = $1 
      ORDER BY display_order
    `, [id]);

    const row = pRes.rows[0];
    return {
      ...row,
      price: parseFloat(row.price),
      original_price: row.original_price ? parseFloat(row.original_price) : null,
      rating: parseFloat(row.rating),
      images: imgRes.rows
    };
  }

  // --- Cart ---
  async getCart(userId) {
    const res = await this.query(`
      SELECT ci.id, ci.quantity, ci.added_at, ci.product_id, 
             p.name, p.price, p.original_price, p.stock,
             (SELECT image_url FROM product_images i WHERE i.product_id = p.id ORDER BY display_order LIMIT 1) as image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      ORDER BY ci.added_at DESC
    `, [userId]);

    const items = res.rows.map(row => ({
      ...row,
      price: parseFloat(row.price),
      original_price: row.original_price ? parseFloat(row.original_price) : null
    }));

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      subtotal: subtotal.toFixed(2),
      itemCount
    };
  }

  async addToCart(userId, productId, quantity = 1) {
    // Check product stock
    const pRes = await this.query(`SELECT stock, name FROM products WHERE id = $1`, [productId]);
    if (pRes.rows.length === 0) throw { statusCode: 404, message: 'Product not found' };
    const stock = pRes.rows[0].stock;

    // Check existing cart item
    const existRes = await this.query(`SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2`, [userId, productId]);
    const existing = existRes.rows[0];

    const newQty = existing ? existing.quantity + quantity : quantity;
    if (newQty > stock) throw { statusCode: 400, message: 'Not enough stock available' };

    if (existing) {
      const res = await this.query(`
        UPDATE cart_items SET quantity = $1, added_at = CURRENT_TIMESTAMP
        WHERE user_id = $2 AND product_id = $3 RETURNING *
      `, [newQty, userId, productId]);
      return res.rows[0];
    } else {
      const res = await this.query(`
        INSERT INTO cart_items (user_id, product_id, quantity) 
        VALUES ($1, $2, $3) RETURNING *
      `, [userId, productId, quantity]);
      return res.rows[0];
    }
  }

  async updateCartItem(id, userId, quantity) {
    const ciRes = await this.query(`SELECT ci.product_id, ci.quantity, p.stock 
      FROM cart_items ci 
      JOIN products p ON ci.product_id = p.id 
      WHERE ci.id = $1 AND ci.user_id = $2`, [id, userId]);

    if (ciRes.rows.length === 0) throw { statusCode: 404, message: 'Cart item not found' };
    const { stock } = ciRes.rows[0];

    if (quantity > stock) throw { statusCode: 400, message: 'Not enough stock available' };

    const updateRes = await this.query(`
      UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *
    `, [quantity, id, userId]);

    return updateRes.rows[0];
  }

  async removeFromCart(id, userId) {
    const res = await this.query(`DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    if (res.rowCount === 0) throw { statusCode: 404, message: 'Cart item not found' };
  }

  // --- Orders ---
  async placeOrder(userId, shippingInfo) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get cart items
      const cartRes = await client.query(`
        SELECT ci.product_id, ci.quantity, p.price, p.stock, p.name
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = $1
      `, [userId]);

      const cartItems = cartRes.rows;
      if (cartItems.length === 0) throw { statusCode: 400, message: 'Cart is empty' };

      let totalAmount = 0;

      // 2. Validate stock and calculate total
      for (const item of cartItems) {
        if (item.quantity > item.stock) {
          throw { statusCode: 400, message: `Not enough stock for "${item.name}". Available: ${item.stock}` };
        }
        totalAmount += parseFloat(item.price) * item.quantity;
      }

      // 3. Create order
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderNumber = `AMZ-${timestamp}-${random}`;

      const orderRes = await client.query(`
        INSERT INTO orders (user_id, order_number, total_amount, status, shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
      `, [
        userId, orderNumber, totalAmount, 'Placed',
        shippingInfo.shipping_name, shippingInfo.shipping_address, shippingInfo.shipping_city,
        shippingInfo.shipping_state, shippingInfo.shipping_zip, shippingInfo.shipping_phone
      ]);
      const order = orderRes.rows[0];

      // 4. Create order items and update stock
      const orderItemsToReturn = [];
      for (const item of cartItems) {
        await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
          VALUES ($1, $2, $3, $4)
        `, [order.id, item.product_id, item.quantity, item.price]);

        await client.query(`
          UPDATE products SET stock = stock - $1 WHERE id = $2
        `, [item.quantity, item.product_id]);

        orderItemsToReturn.push({
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price)
        });
      }

      // 5. Clear cart
      await client.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);

      await client.query('COMMIT');

      return {
        order: {
          ...order,
          total_amount: parseFloat(order.total_amount)
        },
        items: orderItemsToReturn
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getOrders(userId) {
    const res = await this.query(`
      SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC
    `, [userId]);

    const orders = res.rows;
    for (let order of orders) {
      order.total_amount = parseFloat(order.total_amount);
      const itemsRes = await this.query(`
        SELECT oi.*, p.name as product_name, 
               (SELECT image_url FROM product_images i WHERE i.product_id = oi.product_id ORDER BY display_order LIMIT 1) as image_url
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [order.id]);
      
      order.items = itemsRes.rows.map(row => ({
        ...row,
        price_at_purchase: parseFloat(row.price_at_purchase)
      }));
    }

    return orders;
  }

  async getOrder(id, userId) {
    const res = await this.query(`SELECT * FROM orders WHERE id = $1 AND user_id = $2`, [id, userId]);
    if (res.rows.length === 0) return null;
    const order = res.rows[0];
    order.total_amount = parseFloat(order.total_amount);

    const itemsRes = await this.query(`
        SELECT oi.*, p.name as product_name, 
               (SELECT image_url FROM product_images i WHERE i.product_id = oi.product_id ORDER BY display_order LIMIT 1) as image_url
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
    `, [order.id]);

    order.items = itemsRes.rows.map(row => ({
      ...row,
      price_at_purchase: parseFloat(row.price_at_purchase)
    }));

    return order;
  }
}

const db = new Database();
module.exports = db;
