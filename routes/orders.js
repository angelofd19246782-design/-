const express = require('express');
const crypto = require('crypto');
const db = require('../db/database');

const router = express.Router();

const ALLOWED_PAYMENTS = new Set(['cash', 'transfer', 'card']);
const MAX_QTY_PER_LINE = 50;

const productStmt = db.prepare('SELECT id, name, price FROM products WHERE id = ? AND in_stock = 1');

const insertOrder = db.prepare(`
  INSERT INTO orders (order_number, customer_name, phone, address, payment_method, total, status, eta_min, eta_max)
  VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?)
`);

const insertItem = db.prepare(`
  INSERT INTO order_items (order_id, product_id, name, price, quantity)
  VALUES (?, ?, ?, ?, ?)
`);

const findOrderByNumberAndPhone = db.prepare(`
  SELECT id, order_number, customer_name, phone, address, payment_method, total, status,
         eta_min, eta_max, created_at, updated_at
  FROM orders
  WHERE order_number = ? AND phone = ?
`);

const findItemsForOrder = db.prepare(`
  SELECT name, price, quantity FROM order_items WHERE order_id = ? ORDER BY id
`);

function makeOrderNumber() {
  const yymmdd = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = crypto.randomInt(1000, 9999);
  return `R${yymmdd}-${rand}`;
}

function normalizePhone(s) {
  return String(s || '').replace(/[^\d+]/g, '');
}

// Easy to swap with a real distance API later
function estimateEta(address) {
  const text = String(address || '').trim();
  const len = text.length;
  const farKeywords = /(시|도|군|외곽|시외|incheon|busan|daegu|gwangju|suwon|ansan|cheonan)/i;
  if (len > 60 || farKeywords.test(text)) return { min: 60, max: 90 };
  return { min: 30, max: 60 };
}

router.post('/', (req, res) => {
  const body = req.body || {};
  const customer = body.customer || {};
  const items = Array.isArray(body.items) ? body.items : [];
  const payment = String(body.payment || '').toLowerCase();

  const name = String(customer.name || '').trim();
  const phone = normalizePhone(customer.phone);
  const address = String(customer.address || '').trim();

  if (!name || name.length < 2) return res.status(400).json({ error: 'Please enter your name.' });
  if (!phone || phone.length < 7) return res.status(400).json({ error: 'Please enter a valid phone number.' });
  if (!address || address.length < 5) return res.status(400).json({ error: 'Please enter a delivery address.' });
  if (!ALLOWED_PAYMENTS.has(payment)) return res.status(400).json({ error: 'Please choose a payment method.' });
  if (items.length === 0) return res.status(400).json({ error: 'Cart is empty.' });

  const resolved = [];
  for (const raw of items) {
    const productId = Number(raw && raw.productId);
    const quantity = Number(raw && raw.quantity);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Invalid product in cart.' });
    }
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > MAX_QTY_PER_LINE) {
      return res.status(400).json({ error: `Invalid quantity (1–${MAX_QTY_PER_LINE}).` });
    }
    const product = productStmt.get(productId);
    if (!product) return res.status(400).json({ error: 'A product in the cart is no longer available.' });
    resolved.push({ product, quantity });
  }

  // Server-side total — never trust the client.
  const total = resolved.reduce((sum, r) => sum + r.product.price * r.quantity, 0);
  const eta = estimateEta(address);

  // Make sure the order number is unique even on a (very rare) collision
  let orderNumber = makeOrderNumber();
  let attempts = 0;
  let inserted;
  const tx = db.transaction(() => {
    while (attempts < 5) {
      try {
        const result = insertOrder.run(orderNumber, name, phone, address, payment, total, eta.min, eta.max);
        for (const r of resolved) {
          insertItem.run(result.lastInsertRowid, r.product.id, r.product.name, r.product.price, r.quantity);
        }
        inserted = { id: result.lastInsertRowid, orderNumber };
        return;
      } catch (e) {
        if (String(e.message).includes('UNIQUE') && attempts < 4) {
          attempts += 1;
          orderNumber = makeOrderNumber();
          continue;
        }
        throw e;
      }
    }
  });

  try {
    tx();
  } catch (e) {
    console.error('[raduga] order insert failed', e);
    return res.status(500).json({ error: 'Could not save the order. Please try again.' });
  }

  res.status(201).json({
    orderNumber: inserted.orderNumber,
    status: 'new',
    total,
    eta
  });
});

router.get('/track', (req, res) => {
  const orderNumber = String(req.query.orderNumber || '').trim().toUpperCase();
  const phone = normalizePhone(req.query.phone);
  if (!orderNumber || !phone) {
    return res.status(400).json({ error: 'Order number and phone are required.' });
  }
  const order = findOrderByNumberAndPhone.get(orderNumber, phone);
  if (!order) return res.status(404).json({ error: 'Order not found. Please check the number and phone.' });

  const items = findItemsForOrder.all(order.id);
  res.json({
    orderNumber: order.order_number,
    status: order.status,
    total: order.total,
    eta: { min: order.eta_min, max: order.eta_max },
    customerName: order.customer_name,
    address: order.address,
    paymentMethod: order.payment_method,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items
  });
});

module.exports = router;
