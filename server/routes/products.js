const express = require('express');
const router = express.Router();
const db = require('../db/pool');

// GET /api/products - List all products with optional search and category filter
router.get('/', (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    const products = db.getAllProducts({ search, category, sort });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id - Get single product with images
router.get('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const product = db.getProduct(id);

    if (!product) {
      return res.status(404).json({ error: { message: 'Product not found' } });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
