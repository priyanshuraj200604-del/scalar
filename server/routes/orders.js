const express = require('express');
const router = express.Router();
const db = require('../db/pool');

const DEFAULT_USER_ID = 1;

// POST /api/orders - Place an order from cart
router.post('/', async (req, res, next) => {
  try {
    const { shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_phone } = req.body;

    // Validate shipping info
    if (!shipping_name || !shipping_address || !shipping_city || !shipping_state || !shipping_zip || !shipping_phone) {
      return res.status(400).json({ error: { message: 'All shipping fields are required' } });
    }

    const result = await db.placeOrder(DEFAULT_USER_ID, {
      shipping_name,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_zip,
      shipping_phone,
    });

    res.status(201).json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { message: err.message } });
    }
    next(err);
  }
});

// GET /api/orders - List all orders for default user
router.get('/', async (req, res, next) => {
  try {
    const orders = await db.getOrders(DEFAULT_USER_ID);
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const order = await db.getOrder(id, DEFAULT_USER_ID);

    if (!order) {
      return res.status(404).json({ error: { message: 'Order not found' } });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
