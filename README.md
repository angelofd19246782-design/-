# Raduga — CIS Food Store Online Catalog

A production-ready online catalog and order management system for **Raduga**, a CIS / Russian food store chain operating in South Korea.

Customers browse products, build a cart, and place delivery orders with minimal friction. Employees log in to a clean admin panel to track and process incoming orders.

## Stack

- **Backend:** Node.js + Express
- **Database:** SQLite (file-based, via `better-sqlite3`)
- **Frontend:** Vanilla HTML / CSS / JavaScript — no build step, no frameworks
- **Auth:** Session cookies (`express-session`) + bcrypt password hashing

## Features

### Customer
- Beautiful product catalog with categories (drinks, sweets, dairy, frozen, bakery, groceries, meat/sausages, ready food)
- Search and category filtering
- Cart with quantity controls and live total
- Checkout with minimal fields (name, phone, address, payment method)
- Order tracking by order number + phone
- Approximate delivery time estimate

### Employee
- Login-protected admin panel
- Dashboard listing all orders
- Order details view
- One-click status transitions: New → Collecting → On the way → Delivered

### Engineering
- Server-side total calculation (frontend prices never trusted)
- Prepared SQL statements
- Validation on both frontend and backend
- CSS variables, responsive layout
- Empty / loading / error states

## Local Development

```bash
git clone <your-repo-url> raduga
cd raduga
cp .env.example .env
npm install
npm start
```

Then open http://localhost:3000

The database is created and seeded automatically on first launch at `./data/raduga.sqlite`.

### Default admin login
- **Username:** `admin`
- **Password:** `raduga2024`

(Change via `.env` *before* the first launch, or update the password in the database afterwards.)

### Reseeding products

```bash
npm run seed
```

This refreshes the products table with the demo catalog. Existing orders are not affected.

### Hosting your own product images

By default the catalog uses public photos from Wikimedia Commons and
Open Food Facts. To replace any product with a clean studio photo
sourced from a marketplace (Ozon, Wildberries, Amazon, brand site,
etc.), use the bundled fetcher:

```bash
# 1. Copy the example manifest and fill it in
cp scripts/images.manifest.example.json scripts/images.manifest.json
# … edit the file: paste URLs against the keys you care about …

# 2. Download into public/images/products/
npm run fetch-images

# 3. The script prints a snippet to paste into db/seed.js (the IMG
#    object), pointing each key at /images/products/<key>.<ext>.

# 4. Refresh the DB
npm run seed
```

`scripts/images.manifest.json` is git-ignored, so each environment
can have its own URL list. Add `--force` to the fetch command to
redownload existing files. The script follows up to 5 redirects and
times out after 20 s per file.

## Deploying to Railway

1. Push this repo to GitHub.
2. On Railway, create a new project → "Deploy from GitHub" → select the repo.
3. Railway auto-detects Node.js and runs `npm install` then `npm start`.
4. Set environment variables in Railway:
   - `SESSION_SECRET` — long random string
   - `ADMIN_USERNAME` and `ADMIN_PASSWORD` — admin credentials
   - `PORT` is provided automatically by Railway; the app reads it from `process.env.PORT`.
5. Add a **Volume** mounted at `/app/data` so the SQLite file persists across deploys. Set `DB_PATH=/app/data/raduga.sqlite` in the env vars.

That's it — no additional services required.

## Project layout

```
.
├── server.js              # Express app entry
├── db/
│   ├── database.js        # SQLite connection + schema
│   └── seed.js            # Demo product seed
├── routes/
│   ├── products.js
│   ├── orders.js
│   └── admin.js
├── middleware/
│   └── auth.js
└── public/
    ├── index.html         # Catalog + cart + checkout
    ├── track.html         # Order tracking
    ├── admin/
    │   ├── login.html
    │   └── index.html     # Admin dashboard
    ├── css/
    └── js/
```

## API

### Public
- `GET  /api/products` — list products
- `POST /api/orders` — create order `{ items: [{productId, quantity}], customer, payment }`
- `GET  /api/orders/track?orderNumber=&phone=` — public order status

### Admin (session required)
- `POST   /api/admin/login`
- `POST   /api/admin/logout`
- `GET    /api/admin/orders`
- `GET    /api/admin/orders/:id`
- `PATCH  /api/admin/orders/:id/status` — body `{ status }`

## License

Proprietary — Raduga.
