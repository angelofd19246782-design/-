const express = require('express');
const db = require('../db/database');

const router = express.Router();

const listStmt = db.prepare(`
  SELECT id, name, category, price, description, accent, image_url, in_stock
  FROM products
  WHERE in_stock = 1
  ORDER BY category, name
`);

router.get('/', (req, res) => {
  const rows = listStmt.all();
  res.json({ products: rows });
});

module.exports = router;
