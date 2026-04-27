require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');

const db = require('./db/database');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const { requireAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));

app.use(
  session({
    name: 'raduga.sid',
    secret: process.env.SESSION_SECRET || 'raduga-dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 8 // 8 hours
    }
  })
);

// Auto-seed products on first launch when the table is empty
function ensureSeed() {
  const row = db.prepare('SELECT COUNT(*) AS c FROM products').get();
  if (row.c === 0) {
    require('./db/seed');
  }
}
ensureSeed();

// API
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);

// Health
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Static (catalog, track, admin pages, css, js)
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

// Pages
app.get('/', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.get('/track', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'track.html')));
app.get('/admin/login', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin', 'login.html')));
app.get('/admin', requireAdmin, (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin', 'index.html')));

// 404 fallback
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.status(404).sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[raduga] unhandled error', err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`[raduga] listening on http://localhost:${PORT}`);
});
