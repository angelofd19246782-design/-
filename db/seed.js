require('dotenv').config();
const db = require('./database');

// Product photos are hosted on Wikimedia Commons (upload.wikimedia.org).
// All URLs are CC-licensed thumbnails normalized to 960px wide. They are
// stable content-addressed paths and safe to hotlink. To swap any product
// for your own photo, replace the URL with a local path like
// '/images/products/pelmeni.jpg' and drop the file in public/images/products/.
const W = (path) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}`;

const products = [
  // ===== Frozen =====
  { name: 'Pelmeni "Sibirskie"', category: 'frozen', price: 12500, accent: '#9bc7ff',
    image_url: W('d/df/Pelmeni_Russian.jpg/960px-Pelmeni_Russian.jpg'),
    description: 'Classic Siberian dumplings with juicy beef and pork filling. 800g.' },
  { name: 'Vareniki s kartoshkoi', category: 'frozen', price: 9800, accent: '#a9d6ff',
    image_url: W('5/5f/Wareniki.JPG/960px-Wareniki.JPG'),
    description: 'Soft dumplings with mashed potato and onion. Boil 6 minutes. 700g.' },
  { name: 'Bliny s tvorogom', category: 'frozen', price: 8500, accent: '#f4cf95',
    image_url: W('e/ea/50_%D0%B1%D0%BB%D1%96%D0%BD%D0%BA%D0%BE%D1%9E_%D0%BD%D0%B0_%D1%82%D0%B0%D0%BB%D0%B5%D1%80%D1%86%D1%8B_240_%D0%BC%D0%BC.jpg/960px-50_%D0%B1%D0%BB%D1%96%D0%BD%D0%BA%D0%BE%D1%9E_%D0%BD%D0%B0_%D1%82%D0%B0%D0%BB%D0%B5%D1%80%D1%86%D1%8B_240_%D0%BC%D0%BC.jpg'),
    description: 'Thin Russian pancakes filled with sweet curd cheese. 500g.' },
  { name: 'Chebureki', category: 'frozen', price: 11200, accent: '#f3b97f',
    image_url: W('8/8c/Ayran%2B%C3%87ib%C3%B6rek.jpg/960px-Ayran%2B%C3%87ib%C3%B6rek.jpg'),
    description: 'Crispy fried turnovers with seasoned beef. 600g, 6 pcs.' },

  // ===== Groceries =====
  { name: 'Grechka (Buckwheat groats)', category: 'groceries', price: 6800, accent: '#caa472',
    image_url: W('9/96/%D0%93%D1%80%D0%B5%D1%87%D0%BD%D0%B5%D0%B2%D0%B0%D1%8F_%D0%BA%D0%B0%D1%88%D0%B0.jpg/960px-%D0%93%D1%80%D0%B5%D1%87%D0%BD%D0%B5%D0%B2%D0%B0%D1%8F_%D0%BA%D0%B0%D1%88%D0%B0.jpg'),
    description: 'Premium roasted buckwheat. The classic Russian side dish. 900g.' },
  { name: 'Buckwheat flour', category: 'groceries', price: 5400, accent: '#d6b889',
    image_url: W('9/96/%D0%93%D1%80%D0%B5%D1%87%D0%BD%D0%B5%D0%B2%D0%B0%D1%8F_%D0%BA%D0%B0%D1%88%D0%B0.jpg/960px-%D0%93%D1%80%D0%B5%D1%87%D0%BD%D0%B5%D0%B2%D0%B0%D1%8F_%D0%BA%D0%B0%D1%88%D0%B0.jpg'),
    description: 'Stone-ground buckwheat flour for blini and pancakes. 1kg.' },
  { name: 'Pickled cucumbers', category: 'groceries', price: 7200, accent: '#9ec77c',
    image_url: W('b/bb/Pickle.jpg/960px-Pickle.jpg'),
    description: 'Crunchy salt-pickled cucumbers in dill brine. 720g jar.' },
  { name: 'Adjika spicy paste', category: 'groceries', price: 5900, accent: '#e57b5a',
    image_url: W('3/32/Acuka.jpg/960px-Acuka.jpg'),
    description: 'Hot Caucasian sauce with red pepper, garlic and herbs. 200g.' },
  { name: 'Sunflower seeds', category: 'groceries', price: 4500, accent: '#d6b04c',
    image_url: W('3/39/Sunflower_Seeds_Kaldari.jpg/960px-Sunflower_Seeds_Kaldari.jpg'),
    description: 'Roasted black sunflower seeds, lightly salted. 300g pack.' },
  { name: 'Condensed milk (Sgushchenka)', category: 'groceries', price: 5200, accent: '#e6d59b',
    image_url: W('2/2f/2016-03-26-Gezuckerte_Kondensmilch-4699.jpg/960px-2016-03-26-Gezuckerte_Kondensmilch-4699.jpg'),
    description: 'Sweetened condensed milk in classic blue-and-white tin. 380g.' },
  { name: 'Doshirak instant noodles', category: 'groceries', price: 1800, accent: '#e8a072',
    image_url: W('3/31/Dosirak.jpg/960px-Dosirak.jpg'),
    description: 'Korean–Russian favourite instant noodles. Beef flavour. 90g.' },
  { name: 'Sprats in oil', category: 'groceries', price: 6300, accent: '#a8c0c9',
    image_url: W('2/2b/Odesa_bazaar_%285%29_sprats.JPG/960px-Odesa_bazaar_%285%29_sprats.JPG'),
    description: 'Smoked Baltic sprats in sunflower oil. 160g tin.' },

  // ===== Dairy =====
  { name: 'Smetana 20%', category: 'dairy', price: 6900, accent: '#f1e9d0',
    image_url: W('1/13/Smetana_LCCN2014716851_%28cropped%29.jpg/960px-Smetana_LCCN2014716851_%28cropped%29.jpg'),
    description: 'Thick Russian-style sour cream. Perfect for borscht. 400g.' },
  { name: 'Tvorog 9%', category: 'dairy', price: 7500, accent: '#f3edd8',
    image_url: W('7/7b/Skimmed_milk_quark_on_spoon.jpg/960px-Skimmed_milk_quark_on_spoon.jpg'),
    description: 'Fresh farmer\'s cheese, soft and crumbly. 500g.' },
  { name: 'Kefir 2.5%', category: 'dairy', price: 4800, accent: '#ecf0e3',
    image_url: W('8/83/Kefir_in_a_glass.JPG/960px-Kefir_in_a_glass.JPG'),
    description: 'Fermented milk drink, lightly tart and refreshing. 1L.' },
  { name: 'Ryazhenka 4%', category: 'dairy', price: 5200, accent: '#e8c79a',
    image_url: W('3/37/Ryazhenka16c.JPG/960px-Ryazhenka16c.JPG'),
    description: 'Baked fermented milk with a warm caramel note. 500ml.' },

  // ===== Drinks =====
  { name: 'Borjomi mineral water', category: 'drinks', price: 4500, accent: '#7dbef0',
    image_url: W('1/15/Borjomi_Bottle_0.5L_PET.jpg/960px-Borjomi_Bottle_0.5L_PET.jpg'),
    description: 'Iconic Georgian sparkling mineral water. 500ml glass bottle.' },
  { name: 'Kvass "Ochakovsky"', category: 'drinks', price: 5800, accent: '#b88a4e',
    image_url: W('9/97/Mint_bread_kvas.jpg/960px-Mint_bread_kvas.jpg'),
    description: 'Traditional rye kvass — slightly sweet, lightly fizzy. 1.5L.' },
  { name: 'Mors (cranberry)', category: 'drinks', price: 5400, accent: '#d96a76',
    image_url: W('f/f0/Mors_%28ru._%D0%9C%D0%BE%D1%80%D1%81_-_%D0%BF%D1%80%D0%BE%D1%85%D0%BB%D0%B0%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9_%D0%BD%D0%B5%D0%B3%D0%B0%D0%B7%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D0%B9_%D0%BD%D0%B0%D0%BF%D0%B8%D1%82%D0%BE%D0%BA%29.JPG/960px-Mors_%28ru._%D0%9C%D0%BE%D1%80%D1%81_-_%D0%BF%D1%80%D0%BE%D1%85%D0%BB%D0%B0%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9_%D0%BD%D0%B5%D0%B3%D0%B0%D0%B7%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D0%B9_%D0%BD%D0%B0%D0%BF%D0%B8%D1%82%D0%BE%D0%BA%29.JPG'),
    description: 'Refreshing wild cranberry drink, no added flavours. 1L.' },
  { name: 'Compote (assorted fruit)', category: 'drinks', price: 4900, accent: '#e8a48a',
    image_url: W('a/a3/Peach_kompot.JPG/960px-Peach_kompot.JPG'),
    description: 'Homestyle fruit compote with apples, plums and apricots. 1L.' },

  // ===== Sweets =====
  { name: 'Alenka chocolate bar', category: 'sweets', price: 3500, accent: '#c25a6c',
    image_url: W('e/e1/Alenka_chocolate_2.JPG/960px-Alenka_chocolate_2.JPG'),
    description: 'Legendary Russian milk chocolate bar. 100g.' },
  { name: 'Halva sunflower', category: 'sweets', price: 6200, accent: '#d6b079',
    image_url: W('4/4f/Orient_sweets_%28special_halva%29_Samarkand%2C_Siyab.jpg/960px-Orient_sweets_%28special_halva%29_Samarkand%2C_Siyab.jpg'),
    description: 'Crumbly sunflower halva — sweet and nutty. 300g.' },
  { name: 'Pryaniki (honey cakes)', category: 'sweets', price: 5800, accent: '#caa07a',
    image_url: W('a/a2/Prjaniki.jpg/960px-Prjaniki.jpg'),
    description: 'Soft glazed honey-spice cakes — the original Russian gingerbread. 400g.' },
  { name: 'Zefir vanilla', category: 'sweets', price: 6700, accent: '#f3d8e2',
    image_url: W('2/22/Zefir_in_chocolate_coat.JPG/960px-Zefir_in_chocolate_coat.JPG'),
    description: 'Cloud-like vanilla marshmallow treats. 250g.' },
  { name: 'Krasny Oktyabr candies', category: 'sweets', price: 7400, accent: '#e57676',
    image_url: W('a/a2/Kolomna_Pastila.jpg/960px-Kolomna_Pastila.jpg'),
    description: 'Assorted classic Soviet-era chocolate sweets. 300g.' },

  // ===== Bakery =====
  { name: 'Borodinsky black bread', category: 'bakery', price: 5400, accent: '#8a6240',
    image_url: W('1/1e/Borodinskii_bread.jpg/960px-Borodinskii_bread.jpg'),
    description: 'Dark rye bread with coriander. Perfect with smetana and herring. 500g loaf.' },
  { name: 'Baton (white loaf)', category: 'bakery', price: 4200, accent: '#e3c98e',
    image_url: W('2/2c/Wei%C3%9Fbrot-1.jpg/960px-Wei%C3%9Fbrot-1.jpg'),
    description: 'Soft Russian-style white loaf with a tender crumb. 400g.' },
  { name: 'Sushki (mini-bagels)', category: 'bakery', price: 4800, accent: '#d4ad6e',
    image_url: W('3/36/Sooshki.jpg/960px-Sooshki.jpg'),
    description: 'Small dry ring biscuits — perfect with tea. 300g.' },

  // ===== Meat & sausages =====
  { name: 'Doctor sausage (Doktorskaya)', category: 'meat', price: 13500, accent: '#e0938e',
    image_url: W('a/a9/Lyoner-1.jpg/960px-Lyoner-1.jpg'),
    description: 'Classic boiled "Doctor\'s" sausage, mild and delicate. 500g.' },
  { name: 'Salami "Moskovskaya"', category: 'meat', price: 16800, accent: '#b96655',
    image_url: W('3/37/Salame_di_Sauris.jpg/960px-Salame_di_Sauris.jpg'),
    description: 'Dry-cured beef salami with peppercorns. 300g.' },
  { name: 'Smoked sausage "Krakovskaya"', category: 'meat', price: 14900, accent: '#c87b5d',
    image_url: W('2/20/Kielbasa.jpg/960px-Kielbasa.jpg'),
    description: 'Hot-smoked pork sausage with garlic and pepper. 400g.' },
  { name: 'Salo (cured pork fat)', category: 'meat', price: 11200, accent: '#f0d6c2',
    image_url: W('f/f3/Sa%C5%82o.JPG/960px-Sa%C5%82o.JPG'),
    description: 'Salt-cured pork fat with garlic. Best on black bread. 300g.' },

  // ===== Ready food =====
  { name: 'Olivier salad', category: 'ready', price: 8900, accent: '#cfd6a4',
    image_url: W('8/89/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%9E%D0%BB%D0%B8%D0%B2%D1%8C%D0%B5_03.jpg/960px-%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%9E%D0%BB%D0%B8%D0%B2%D1%8C%D0%B5_03.jpg'),
    description: 'House-made Olivier with bologna, peas, pickles and mayo. 500g.' },
  { name: 'Selyodka pod shuboi', category: 'ready', price: 9800, accent: '#c987a3',
    image_url: W('3/3d/Selidi_pod_shuboi.jpg/960px-Selidi_pod_shuboi.jpg'),
    description: 'Layered "herring under a fur coat" salad with beetroot. 500g.' },
  { name: 'Borscht (ready to heat)', category: 'ready', price: 9500, accent: '#c75858',
    image_url: W('a/a7/Borscht_served.jpg/960px-Borscht_served.jpg'),
    description: 'Rich beetroot soup with beef. Just heat and serve. 700g.' },
  { name: 'Holodets (meat aspic)', category: 'ready', price: 11800, accent: '#d6b894',
    image_url: W('e/e1/Aspic-with-eggs.jpg/960px-Aspic-with-eggs.jpg'),
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
