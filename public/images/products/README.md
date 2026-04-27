# Product images

By default, the catalog uses real product photographs hosted on
Wikimedia Commons (CC-licensed). The exact thumbnail URLs are set
per product in `db/seed.js`.

## Hosting your own photos

To replace any product's image with your own:

1. Drop the file into this folder, e.g. `pelmeni.jpg` or `borjomi.webp`.
   Recommended: 600×450 (4:3), JPEG/WebP, < 100 KB each.
2. Edit `db/seed.js` and change the matching product's `image_url` to
   `/images/products/pelmeni.jpg`.
3. Run `npm run seed` to refresh the catalog (orders are unaffected).

The product card uses `object-fit: cover`, so any reasonably-sized photo
will fill the card cleanly.
