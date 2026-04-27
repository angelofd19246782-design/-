#!/usr/bin/env node
/*
 * Download product images from a JSON manifest into
 * public/images/products/ so they can be hosted locally — no more
 * hot-linking, no more URL rot.
 *
 * Usage:
 *   1. Edit scripts/images.manifest.json (start from the .example file).
 *   2. Run:  npm run fetch-images
 *   3. Update db/seed.js to point at the local paths the script prints.
 *   4. Run:   npm run seed
 *
 * Manifest format:
 *   {
 *     "pelmeni":  "https://www.ozon.ru/.../foo.jpg",
 *     "smetana":  { "url": "https://...", "ext": "webp" },
 *     ...
 *   }
 *
 * Each key becomes the saved filename (extension is auto-detected from
 * the URL or can be overridden).
 *
 * The script preserves files that already exist unless you pass --force.
 * It follows up to 5 redirects and times out after 20s per file.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'products');
const MANIFEST_PATH = process.argv[2] && !process.argv[2].startsWith('--')
  ? path.resolve(process.argv[2])
  : path.join(__dirname, 'images.manifest.json');
const FORCE = process.argv.includes('--force');

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`Manifest not found: ${MANIFEST_PATH}`);
  console.error('Copy scripts/images.manifest.example.json → scripts/images.manifest.json and edit.');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
} catch (e) {
  console.error('Invalid JSON in manifest:', e.message);
  process.exit(1);
}

function pickExt(url) {
  const m = url.split('?')[0].match(/\.([a-zA-Z0-9]{2,5})$/);
  if (!m) return 'jpg';
  const ext = m[1].toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(ext) ? ext : 'jpg';
}

function download(url, destPath, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    if (redirectsLeft < 0) return reject(new Error('Too many redirects'));
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (raduga-image-fetcher)',
          'Accept': 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8'
        },
        timeout: 20000
      },
      (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          res.resume();
          const next = new URL(res.headers.location, url).toString();
          return download(next, destPath, redirectsLeft - 1).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const tmp = destPath + '.part';
        const file = fs.createWriteStream(tmp);
        res.pipe(file);
        let bytes = 0;
        res.on('data', (c) => (bytes += c.length));
        file.on('finish', () => {
          file.close(() => {
            fs.renameSync(tmp, destPath);
            resolve(bytes);
          });
        });
        file.on('error', (e) => {
          try { fs.unlinkSync(tmp); } catch (_) {}
          reject(e);
        });
      }
    );
    req.on('timeout', () => {
      req.destroy(new Error('timeout after 20s'));
    });
    req.on('error', reject);
  });
}

(async () => {
  const seedSnippets = [];
  let ok = 0, skipped = 0, failed = 0;

  for (const [key, raw] of Object.entries(manifest)) {
    if (!raw || typeof raw === 'string' && !raw.trim()) {
      console.log(`  ${key.padEnd(20)} (empty, skipped)`);
      skipped++;
      continue;
    }
    const entry = typeof raw === 'string' ? { url: raw } : raw;
    const ext = entry.ext || pickExt(entry.url);
    const filename = `${key}.${ext}`;
    const dest = path.join(OUT_DIR, filename);

    if (fs.existsSync(dest) && !FORCE) {
      const size = fs.statSync(dest).size;
      console.log(`  ${key.padEnd(20)} (already on disk, ${size}b — pass --force to redownload)`);
      seedSnippets.push(`  ${key}: '/images/products/${filename}',`);
      ok++;
      continue;
    }

    process.stdout.write(`  ${key.padEnd(20)} → fetching… `);
    try {
      const bytes = await download(entry.url, dest);
      console.log(`✓ ${bytes}b`);
      seedSnippets.push(`  ${key}: '/images/products/${filename}',`);
      ok++;
    } catch (e) {
      console.log(`✗ ${e.message}`);
      failed++;
    }
  }

  console.log('');
  console.log(`Done. ${ok} downloaded, ${skipped} skipped, ${failed} failed.`);
  if (seedSnippets.length) {
    console.log('');
    console.log('Paste this into db/seed.js (the IMG object):');
    console.log('---');
    console.log(seedSnippets.join('\n'));
    console.log('---');
  }
  if (failed > 0) process.exit(1);
})();
