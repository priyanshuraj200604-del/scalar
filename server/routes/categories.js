const express = require('express');
const router = express.Router();
const db = require('../db/pool');

// GET /api/categories - List all categories with product counts
router.get('/', (req, res, next) => {
  try {
    const categories = db.getAllCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
