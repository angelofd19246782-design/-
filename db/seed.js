require('dotenv').config();
const db = require('./database');

const products = [
  // Frozen
  { name: 'Pelmeni "Sibirskie"', category: 'frozen', price: 12500, emoji: '🥟', accent: '#9bc7ff',
    description: 'Classic Siberian dumplings with juicy beef and pork filling. 800g.' },
  { name: 'Vareniki s kartoshkoi', category: 'frozen', price: 9800, emoji: '🥟', accent: '#a9d6ff',
    description: 'Soft dumplings with mashed potato and onion. Boil 6 minutes. 700g.' },
  { name: 'Bliny s tvorogom', category: 'frozen', price: 8500, emoji: '🥞', accent: '#f4cf95',
    description: 'Thin Russian pancakes filled with sweet curd cheese. 500g.' },
  { name: 'Chebureki', category: 'frozen', price: 11200, emoji: '🥙', accent: '#f3b97f',
    description: 'Crispy fried turnovers with seasoned beef. 600g, 6 pcs.' },

  // Groceries
  { name: 'Grechka (Buckwheat groats)', category: 'groceries', price: 6800, emoji: '🌾', accent: '#caa472',
    description: 'Premium roasted buckwheat. The classic Russian side dish. 900g.' },
  { name: 'Buckwheat flour', category: 'groceries', price: 5400, emoji: '🌾', accent: '#d6b889',
    description: 'Stone-ground buckwheat flour for blini and pancakes. 1kg.' },
  { name: 'Pickled cucumbers', category: 'groceries', price: 7200, emoji: '🥒', accent: '#9ec77c',
    description: 'Crunchy salt-pickled cucumbers in dill brine. 720g jar.' },
  { name: 'Adjika spicy paste', category: 'groceries', price: 5900, emoji: '🌶️', accent: '#e57b5a',
    description: 'Hot Caucasian sauce with red pepper, garlic and herbs. 200g.' },
  { name: 'Sunflower seeds', category: 'groceries', price: 4500, emoji: '🌻', accent: '#d6b04c',
    description: 'Roasted black sunflower seeds, lightly salted. 300g pack.' },
  { name: 'Condensed milk (Sgushchenka)', category: 'groceries', price: 5200, emoji: '🥫', accent: '#e6d59b',
    description: 'Sweetened condensed milk in classic blue-and-white tin. 380g.' },
  { name: 'Doshirak instant noodles', category: 'groceries', price: 1800, emoji: '🍜', accent: '#e8a072',
    description: 'Korean–Russian favourite instant noodles. Beef flavour. 90g.' },
  { name: 'Sprats in oil', category: 'groceries', price: 6300, emoji: '🐟', accent: '#a8c0c9',
    description: 'Smoked Baltic sprats in sunflower oil. 160g tin.' },

  // Dairy
  { name: 'Smetana 20%', category: 'dairy', price: 6900, emoji: '🥛', accent: '#f1e9d0',
    description: 'Thick Russian-style sour cream. Perfect for borscht. 400g.' },
  { name: 'Tvorog 9%', category: 'dairy', price: 7500, emoji: '🧀', accent: '#f3edd8',
    description: 'Fresh farmer\'s cheese, soft and crumbly. 500g.' },
  { name: 'Kefir 2.5%', category: 'dairy', price: 4800, emoji: '🥛', accent: '#ecf0e3',
    description: 'Fermented milk drink, lightly tart and refreshing. 1L.' },
  { name: 'Ryazhenka 4%', category: 'dairy', price: 5200, emoji: '🥛', accent: '#e8c79a',
    description: 'Baked fermented milk with a warm caramel note. 500ml.' },

  // Drinks
  { name: 'Borjomi mineral water', category: 'drinks', price: 4500, emoji: '💧', accent: '#7dbef0',
    description: 'Iconic Georgian sparkling mineral water. 500ml glass bottle.' },
  { name: 'Kvass "Ochakovsky"', category: 'drinks', price: 5800, emoji: '🍺', accent: '#b88a4e',
    description: 'Traditional rye kvass — slightly sweet, lightly fizzy. 1.5L.' },
  { name: 'Mors (cranberry)', category: 'drinks', price: 5400, emoji: '🍒', accent: '#d96a76',
    description: 'Refreshing wild cranberry drink, no added flavours. 1L.' },
  { name: 'Compote (assorted fruit)', category: 'drinks', price: 4900, emoji: '🍑', accent: '#e8a48a',
    description: 'Homestyle fruit compote with apples, plums and apricots. 1L.' },

  // Sweets
  { name: 'Alenka chocolate bar', category: 'sweets', price: 3500, emoji: '🍫', accent: '#c25a6c',
    description: 'Legendary Russian milk chocolate bar. 100g.' },
  { name: 'Halva sunflower', category: 'sweets', price: 6200, emoji: '🍬', accent: '#d6b079',
    description: 'Crumbly sunflower halva — sweet and nutty. 300g.' },
  { name: 'Pryaniki (honey cakes)', category: 'sweets', price: 5800, emoji: '🍪', accent: '#caa07a',
    description: 'Soft glazed honey-spice cakes — the original Russian gingerbread. 400g.' },
  { name: 'Zefir vanilla', category: 'sweets', price: 6700, emoji: '🍡', accent: '#f3d8e2',
    description: 'Cloud-like vanilla marshmallow treats. 250g.' },
  { name: 'Krasny Oktyabr candies', category: 'sweets', price: 7400, emoji: '🍭', accent: '#e57676',
    description: 'Assorted classic Soviet-era chocolate sweets. 300g.' },

  // Bakery
  { name: 'Borodinsky black bread', category: 'bakery', price: 5400, emoji: '🍞', accent: '#8a6240',
    description: 'Dark rye bread with coriander. Perfect with smetana and herring. 500g loaf.' },
  { name: 'Baton (white loaf)', category: 'bakery', price: 4200, emoji: '🥖', accent: '#e3c98e',
    description: 'Soft Russian-style white loaf with a tender crumb. 400g.' },
  { name: 'Sushki (mini-bagels)', category: 'bakery', price: 4800, emoji: '🥨', accent: '#d4ad6e',
    description: 'Small dry ring biscuits — perfect with tea. 300g.' },

  // Meat & sausages
  { name: 'Doctor sausage (Doktorskaya)', category: 'meat', price: 13500, emoji: '🌭', accent: '#e0938e',
    description: 'Classic boiled "Doctor\'s" sausage, mild and delicate. 500g.' },
  { name: 'Salami "Moskovskaya"', category: 'meat', price: 16800, emoji: '🥓', accent: '#b96655',
    description: 'Dry-cured beef salami with peppercorns. 300g.' },
  { name: 'Smoked sausage "Krakovskaya"', category: 'meat', price: 14900, emoji: '🌭', accent: '#c87b5d',
    description: 'Hot-smoked pork sausage with garlic and pepper. 400g.' },
  { name: 'Salo (cured pork fat)', category: 'meat', price: 11200, emoji: '🥩', accent: '#f0d6c2',
    description: 'Salt-cured pork fat with garlic. Best on black bread. 300g.' },

  // Ready food
  { name: 'Olivier salad', category: 'ready', price: 8900, emoji: '🥗', accent: '#cfd6a4',
    description: 'House-made Olivier with bologna, peas, pickles and mayo. 500g.' },
  { name: 'Selyodka pod shuboi', category: 'ready', price: 9800, emoji: '🐟', accent: '#c987a3',
    description: 'Layered "herring under a fur coat" salad with beetroot. 500g.' },
  { name: 'Borscht (ready to heat)', category: 'ready', price: 9500, emoji: '🍲', accent: '#c75858',
    description: 'Rich beetroot soup with beef. Just heat and serve. 700g.' },
  { name: 'Holodets (meat aspic)', category: 'ready', price: 11800, emoji: '🍖', accent: '#d6b894',
    description: 'Traditional meat in jelly with garlic. Serve with mustard. 500g.' }
];

const reset = db.transaction(() => {
  db.prepare('DELETE FROM products').run();
  db.prepare("DELETE FROM sqlite_sequence WHERE name='products'").run();
  const insert = db.prepare(`
    INSERT INTO products (name, category, price, description, emoji, accent, in_stock)
    VALUES (@name, @category, @price, @description, @emoji, @accent, 1)
  `);
  for (const p of products) insert.run(p);
});

reset();
console.log(`[raduga] Seeded ${products.length} products.`);

if (require.main === module) {
  process.exit(0);
}
