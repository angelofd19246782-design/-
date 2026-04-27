const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const STATUS_FLOW = ['new', 'collecting', 'on_the_way', 'delivered'];
const STATUS_SET = new Set(STATUS_FLOW);

const findEmployee = db.prepare('SELECT id, username, password_hash, name FROM employees WHERE username = ?');
const listOrders = db.prepare(`
  SELECT id, order_number, customer_name, phone, address, payment_method, total, status,
         eta_min, eta_max, created_at, updated_at
  FROM orders
  ORDER BY
    CASE status
      WHEN 'new' THEN 0
      WHEN 'collecting' THEN 1
      WHEN 'on_the_way' THEN 2
      WHEN 'delivered' THEN 3
      ELSE 4
    END,
    datetime(created_at) DESC
`);
const findOrder = db.prepare(`
  SELECT id, order_number, customer_name, phone, address, payment_method, total, status,
         eta_min, eta_max, created_at, updated_at
  FROM orders WHERE id = ?
`);
const findOrderItems = db.prepare(`
  SELECT id, product_id, name, price, quantity FROM order_items WHERE order_id = ? ORDER BY id
`);
const updateStatus = db.prepare(`
  UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?
`);

router.post('/login', (req, res) => {
  const username = String((req.body && req.body.username) || '').trim();
  const password = String((req.body && req.body.password) || '');
  if (!username || !password) return res.status(400).json({ error: 'Enter username and password.' });

  const employee = findEmployee.get(username);
  if (!employee || !bcrypt.compareSync(password, employee.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  req.session.employeeId = employee.id;
  req.session.employeeName = employee.name || employee.username;
  res.json({ ok: true, name: employee.name || employee.username });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (req.session && req.session.employeeId) {
    return res.json({ authenticated: true, name: req.session.employeeName });
  }
  res.json({ authenticated: false });
});

router.get('/orders', requireAdmin, (req, res) => {
  res.json({ orders: listOrders.all() });
});

router.get('/orders/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Bad id' });
  const order = findOrder.get(id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = findOrderItems.all(id);
  res.json({ order, items });
});

router.patch('/orders/:id/status', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Bad id' });
  const status = String((req.body && req.body.status) || '').toLowerCase();
  if (!STATUS_SET.has(status)) return res.status(400).json({ error: 'Invalid status.' });
  const result = updateStatus.run(status, id);
  if (result.changes === 0) return res.status(404).json({ error: 'Order not found' });
  res.json({ ok: true, status });
});

module.exports = router;
