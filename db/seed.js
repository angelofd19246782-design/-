require('dotenv').config();
const db = require('./database');

// image_url points to /images/products/<file>.svg by default. To use a real
// photograph for any product, drop the file into public/images/products/ and
// change the image_url here (e.g. '/images/products/pelmeni.jpg') — the card
// will display it automatically with object-fit: cover.

const IMG = (file) => `/images/products/${file}`;

const products = [
  // Frozen
  { name: 'Pelmeni "Sibirskie"', category: 'frozen', price: 12500, accent: '#9bc7ff',
    image_url: IMG('dumpling.svg'),
    description: 'Classic Siberian dumplings with juicy beef and pork filling. 800g.' },
  { name: 'Vareniki s kartoshkoi', category: 'frozen', price: 9800, accent: '#a9d6ff',
    image_url: IMG('dumpling.svg'),
    description: 'Soft dumplings with mashed potato and onion. Boil 6 minutes. 700g.' },
  { name: 'Bliny s tvorogom', category: 'frozen', price: 8500, accent: '#f4cf95',
    image_url: IMG('pancake-stack.svg'),
    description: 'Thin Russian pancakes filled with sweet curd cheese. 500g.' },
  { name: 'Chebureki', category: 'frozen', price: 11200, accent: '#f3b97f',
    image_url: IMG('pastry.svg'),
    description: 'Crispy fried turnovers with seasoned beef. 600g, 6 pcs.' },

  // Groceries
  { name: 'Grechka (Buckwheat groats)', category: 'groceries', price: 6800, accent: '#caa472',
    image_url: IMG('bag.svg'),
    description: 'Premium roasted buckwheat. The classic Russian side dish. 900g.' },
  { name: 'Buckwheat flour', category: 'groceries', price: 5400, accent: '#d6b889',
    image_url: IMG('bag.svg'),
    description: 'Stone-ground buckwheat flour for blini and pancakes. 1kg.' },
  { name: 'Pickled cucumbers', category: 'groceries', price: 7200, accent: '#9ec77c',
    image_url: IMG('jar.svg'),
    description: 'Crunchy salt-pickled cucumbers in dill brine. 720g jar.' },
  { name: 'Adjika spicy paste', category: 'groceries', price: 5900, accent: '#e57b5a',
    image_url: IMG('jar.svg'),
    description: 'Hot Caucasian sauce with red pepper, garlic and herbs. 200g.' },
  { name: 'Sunflower seeds', category: 'groceries', price: 4500, accent: '#d6b04c',
    image_url: IMG('bag.svg'),
    description: 'Roasted black sunflower seeds, lightly salted. 300g pack.' },
  { name: 'Condensed milk (Sgushchenka)', category: 'groceries', price: 5200, accent: '#e6d59b',
    image_url: IMG('tin-can.svg'),
    description: 'Sweetened condensed milk in classic blue-and-white tin. 380g.' },
  { name: 'Doshirak instant noodles', category: 'groceries', price: 1800, accent: '#e8a072',
    image_url: IMG('noodle-cup.svg'),
    description: 'Korean–Russian favourite instant noodles. Beef flavour. 90g.' },
  { name: 'Sprats in oil', category: 'groceries', price: 6300, accent: '#a8c0c9',
    image_url: IMG('tin-can.svg'),
    description: 'Smoked Baltic sprats in sunflower oil. 160g tin.' },

  // Dairy
  { name: 'Smetana 20%', category: 'dairy', price: 6900, accent: '#f1e9d0',
    image_url: IMG('dairy-tub.svg'),
    description: 'Thick Russian-style sour cream. Perfect for borscht. 400g.' },
  { name: 'Tvorog 9%', category: 'dairy', price: 7500, accent: '#f3edd8',
    image_url: IMG('dairy-tub.svg'),
    description: 'Fresh farmer\'s cheese, soft and crumbly. 500g.' },
  { name: 'Kefir 2.5%', category: 'dairy', price: 4800, accent: '#ecf0e3',
    image_url: IMG('bottle.svg'),
    description: 'Fermented milk drink, lightly tart and refreshing. 1L.' },
  { name: 'Ryazhenka 4%', category: 'dairy', price: 5200, accent: '#e8c79a',
    image_url: IMG('bottle.svg'),
    description: 'Baked fermented milk with a warm caramel note. 500ml.' },

  // Drinks
  { name: 'Borjomi mineral water', category: 'drinks', price: 4500, accent: '#7dbef0',
    image_url: IMG('bottle.svg'),
    description: 'Iconic Georgian sparkling mineral water. 500ml glass bottle.' },
  { name: 'Kvass "Ochakovsky"', category: 'drinks', price: 5800, accent: '#b88a4e',
    image_url: IMG('bottle.svg'),
    description: 'Traditional rye kvass — slightly sweet, lightly fizzy. 1.5L.' },
  { name: 'Mors (cranberry)', category: 'drinks', price: 5400, accent: '#d96a76',
    image_url: IMG('bottle.svg'),
    description: 'Refreshing wild cranberry drink, no added flavours. 1L.' },
  { name: 'Compote (assorted fruit)', category: 'drinks', price: 4900, accent: '#e8a48a',
    image_url: IMG('jar.svg'),
    description: 'Homestyle fruit compote with apples, plums and apricots. 1L.' },

  // Sweets
  { name: 'Alenka chocolate bar', category: 'sweets', price: 3500, accent: '#c25a6c',
    image_url: IMG('chocolate-bar.svg'),
    description: 'Legendary Russian milk chocolate bar. 100g.' },
  { name: 'Halva sunflower', category: 'sweets', price: 6200, accent: '#d6b079',
    image_url: IMG('chocolate-bar.svg'),
    description: 'Crumbly sunflower halva — sweet and nutty. 300g.' },
  { name: 'Pryaniki (honey cakes)', category: 'sweets', price: 5800, accent: '#caa07a',
    image_url: IMG('cookies.svg'),
    description: 'Soft glazed honey-spice cakes — the original Russian gingerbread. 400g.' },
  { name: 'Zefir vanilla', category: 'sweets', price: 6700, accent: '#f3d8e2',
    image_url: IMG('cookies.svg'),
    description: 'Cloud-like vanilla marshmallow treats. 250g.' },
  { name: 'Krasny Oktyabr candies', category: 'sweets', price: 7400, accent: '#e57676',
    image_url: IMG('cookies.svg'),
    description: 'Assorted classic Soviet-era chocolate sweets. 300g.' },

  // Bakery
  { name: 'Borodinsky black bread', category: 'bakery', price: 5400, accent: '#8a6240',
    image_url: IMG('bread-loaf.svg'),
    description: 'Dark rye bread with coriander. Perfect with smetana and herring. 500g loaf.' },
  { name: 'Baton (white loaf)', category: 'bakery', price: 4200, accent: '#e3c98e',
    image_url: IMG('bread-loaf.svg'),
    description: 'Soft Russian-style white loaf with a tender crumb. 400g.' },
  { name: 'Sushki (mini-bagels)', category: 'bakery', price: 4800, accent: '#d4ad6e',
    image_url: IMG('cookies.svg'),
    description: 'Small dry ring biscuits — perfect with tea. 300g.' },

  // Meat & sausages
  { name: 'Doctor sausage (Doktorskaya)', category: 'meat', price: 13500, accent: '#e0938e',
    image_url: IMG('sausage.svg'),
    description: 'Classic boiled "Doctor\'s" sausage, mild and delicate. 500g.' },
  { name: 'Salami "Moskovskaya"', category: 'meat', price: 16800, accent: '#b96655',
    image_url: IMG('sausage.svg'),
    description: 'Dry-cured beef salami with peppercorns. 300g.' },
  { name: 'Smoked sausage "Krakovskaya"', category: 'meat', price: 14900, accent: '#c87b5d',
    image_url: IMG('sausage.svg'),
    description: 'Hot-smoked pork sausage with garlic and pepper. 400g.' },
  { name: 'Salo (cured pork fat)', category: 'meat', price: 11200, accent: '#f0d6c2',
    image_url: IMG('chocolate-bar.svg'),
    description: 'Salt-cured pork fat with garlic. Best on black bread. 300g.' },

  // Ready food
  { name: 'Olivier salad', category: 'ready', price: 8900, accent: '#cfd6a4',
    image_url: IMG('bowl.svg'),
    description: 'House-made Olivier with bologna, peas, pickles and mayo. 500g.' },
  { name: 'Selyodka pod shuboi', category: 'ready', price: 9800, accent: '#c987a3',
    image_url: IMG('bowl.svg'),
    description: 'Layered "herring under a fur coat" salad with beetroot. 500g.' },
  { name: 'Borscht (ready to heat)', category: 'ready', price: 9500, accent: '#c75858',
    image_url: IMG('bowl.svg'),
    description: 'Rich beetroot soup with beef. Just heat and serve. 700g.' },
  { name: 'Holodets (meat aspic)', category: 'ready', price: 11800, accent: '#d6b894',
    image_url: IMG('bowl.svg'),
    description: 'Traditional meat in jelly with garlic. Serve with mustard. 500g.' }
];

const reset = db.transaction(() => {
  db.prepare('DELETE FROM products').run();
  db.prepare("DELETE FROM sqlite_sequence WHERE name='products'").run();
  const insert = db.prepare(`
    INSERT INTO products (name, category, price, description, accent, image_url, in_stock)
    VALUES (@name, @category, @price, @description, @accent, @image_url, 1)
  `);
  for (const p of products) insert.run(p);
});

reset();
console.log(`[raduga] Seeded ${products.length} products.`);

if (require.main === module) {
  process.exit(0);
}
