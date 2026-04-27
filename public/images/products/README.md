# Product images

The catalog ships with hand-crafted SVG illustrations grouped by product type
(`bottle.svg`, `bag.svg`, `dumpling.svg`, etc.) so the catalog looks polished
out of the box.

## Swapping in a real photograph

To replace any product's illustration with a real photograph:

1. Drop the file into this folder, e.g. `pelmeni.jpg` or `borjomi.webp`.
   Recommended: 600×450 (4:3), JPEG/WebP, < 100 KB each.
2. Edit `db/seed.js` and change the matching product's `image_url` to
   `/images/products/pelmeni.jpg`.
3. Run `npm run seed` to refresh the catalog (orders are unaffected).

The product card uses `object-fit: cover`, so any reasonably-sized photo
will fill the card cleanly.
