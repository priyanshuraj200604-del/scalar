const express = require('express');
const router = express.Router();
const db = require('../db/pool');

const DEFAULT_USER_ID = 1;

// GET /api/cart - Get cart items for default user
router.get('/', async (req, res, next) => {
  try {
    const cart = await db.getCart(DEFAULT_USER_ID);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// POST /api/cart - Add item to cart
router.post('/', async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: { message: 'product_id is required' } });
    }

    const result = await db.addToCart(DEFAULT_USER_ID, product_id, quantity);
    res.status(201).json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { message: err.message } });
    }
    next(err);
  }
});

// PUT /api/cart/:id - Update cart item quantity
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: { message: 'quantity must be at least 1' } });
    }

    const result = await db.updateCartItem(id, DEFAULT_USER_ID, quantity);
    res.json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { message: err.message } });
    }
    next(err);
  }
});

// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await db.removeFromCart(id, DEFAULT_USER_ID);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { message: err.message } });
    }
    next(err);
  }
});

module.exports = router;
