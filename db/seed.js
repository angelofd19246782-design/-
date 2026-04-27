require('dotenv').config();
const db = require('./database');

// Strict catalog discipline: every image_url is a clean studio-style packaging
// shot from Wikimedia Commons (CC-licensed, content-addressed 960px thumb).
// Photos with table / kitchen / hands / multi-product environments have been
// retired in favour of fewer, cleaner photos — products with the same
// packaging silhouette share a single photo so the catalog reads as one
// uniform grid, like a real delivery app.
const W = (path) => `https://upload.wikimedia.org/wikipedia/commons/${path}`;

// Mixed sources: Wikimedia Commons (W) for general silhouettes, and
// Open Food Facts (OFF) for actual branded product photos where the
// brand match is exact. OFF URLs are user-uploaded packaging fronts;
// they're stable on images.openfoodfacts.org and content-addressed.
const OFF = (path) => `https://images.openfoodfacts.org/images/products/${path}`;

const IMG = {
  // Boxed / cardboard rectangular pack — for frozen + Pryaniki
  pryaniki_box:    W('thumb/e/ea/Dutch_style_gingerbread_load%2C_German_packaging.jpg/960px-Dutch_style_gingerbread_load%2C_German_packaging.jpg'),

  // Bag / sack — for grains, seeds, and dry biscuits
  flour_bag:       W('thumb/e/ee/A_nice_bag_of_wheat_flour%21.jpg/960px-A_nice_bag_of_wheat_flour%21.jpg'),

  // Glass jar — Maille brand cornichons (real packaging from OFF)
  pickle_jar:      OFF('872/270/043/0889/front_fr.79.400.jpg'),

  // Adjika — real Caucasian-style brand product (OFF: Goldjick)
  adjika_jar:      OFF('460/704/311/0428/front_fr.7.400.jpg'),

  // Condensed milk can — Eagle Brand front
  eagle_milk_can:  W('thumb/1/1f/Gail_Borden_Eagle_Brand_Condensed_Milk_%28front%29.jpg/960px-Gail_Borden_Eagle_Brand_Condensed_Milk_%28front%29.jpg'),

  // Instant noodle cup
  doshirak_cup:    W('thumb/9/95/Paldo_Dosirac_noodles_20210605_002.jpg/960px-Paldo_Dosirac_noodles_20210605_002.jpg'),

  // Plastic dairy tub — also reused for deli-style ready food
  sour_cream_tub:  W('thumb/4/46/Moscow%2C_Aug.2025_-_Pyatyorochka_private-label_sour_cream_01.jpg/960px-Moscow%2C_Aug.2025_-_Pyatyorochka_private-label_sour_cream_01.jpg'),
  twarog_tub:      W('thumb/3/3b/Twarog_packaged.JPG/960px-Twarog_packaged.JPG'),

  // Bottles — Borjomi is the actual brand product (OFF), cranberry is generic
  borjomi_bottle:  OFF('486/001/900/1346/front_fr.3.400.jpg'),
  cranberry_bottle:W('thumb/8/83/Lifetothefullest_cranberry_juice_bottle%2C_Hillegersberg%2C_Rotterdam_%282022%29_04.jpg/960px-Lifetothefullest_cranberry_juice_bottle%2C_Hillegersberg%2C_Rotterdam_%282022%29_04.jpg'),

  // Wrapped chocolate bar — for sweets
  alenka_bar:      W('thumb/e/e1/Alenka_chocolate_2.JPG/960px-Alenka_chocolate_2.JPG'),

  // Cured-meat sausages — Tarczyński Krakowska sucha (real Polish brand, OFF)
  krakowska_meat:  OFF('590/823/053/1521/front_en.3.400.jpg'),

  // Salo — Lackmann actual brand product (OFF)
  salo_pack:       OFF('000/000/000/4270/front_de.3.400.jpg'),

  // Bread loaves — kept as the actual product because no clean
  // "packaged loaf" photo exists in Commons for either type
  rye_loaf:        W('thumb/1/1f/Roggenbrot-Laib_Loaf-rye-bread.JPG/960px-Roggenbrot-Laib_Loaf-rye-bread.JPG'),
  baton_loaf:      W('thumb/a/ad/%D0%91%D0%B0%D1%82%D0%BE%D0%BD_%D0%A1%D0%BB%D0%BE%D0%B1%D0%BE%D0%B6%D0%B0%D0%BD%D1%81%D0%BA%D0%B8%D0%B9_%D0%A5%D0%B0%D1%80%D1%8C%D0%BA%D0%BE%D0%B2.JPG/960px-%D0%91%D0%B0%D1%82%D0%BE%D0%BD_%D0%A1%D0%BB%D0%BE%D0%B1%D0%BE%D0%B6%D0%B0%D0%BD%D1%81%D0%BA%D0%B8%D0%B9_%D0%A5%D0%B0%D1%80%D1%8C%D0%BA%D0%BE%D0%B2.JPG')
};

const products = [
  // ===== Frozen — all in cardboard freezer-aisle box =====
  { name: 'Pelmeni "Sibirskie"', category: 'frozen', price: 12500, accent: '#9bc7ff',
    image_url: IMG.pryaniki_box,
    description: 'Classic Siberian dumplings with juicy beef and pork filling. 800g pack.' },
  { name: 'Vareniki s kartoshkoi', category: 'frozen', price: 9800, accent: '#a9d6ff',
    image_url: IMG.pryaniki_box,
    description: 'Soft dumplings with mashed potato and onion. Boil 6 minutes. 700g pack.' },
  { name: 'Bliny s tvorogom', category: 'frozen', price: 8500, accent: '#f4cf95',
    image_url: IMG.pryaniki_box,
    description: 'Thin Russian pancakes filled with sweet curd cheese. Frozen 500g pack.' },
  { name: 'Chebureki', category: 'frozen', price: 11200, accent: '#f3b97f',
    image_url: IMG.pryaniki_box,
    description: 'Crispy fried turnovers with seasoned beef. Frozen 600g, 6 pcs.' },

  // ===== Groceries =====
  { name: 'Grechka (Buckwheat groats)', category: 'groceries', price: 6800, accent: '#caa472',
    image_url: IMG.flour_bag,
    description: 'Premium roasted buckwheat. The classic Russian side dish. 900g bag.' },
  { name: 'Buckwheat flour', category: 'groceries', price: 5400, accent: '#d6b889',
    image_url: IMG.flour_bag,
    description: 'Stone-ground buckwheat flour for blini and pancakes. 1kg bag.' },
  { name: 'Sunflower seeds', category: 'groceries', price: 4500, accent: '#d6b04c',
    image_url: IMG.flour_bag,
    description: 'Roasted black sunflower seeds, lightly salted. 300g pack.' },
  { name: 'Pickled cucumbers', category: 'groceries', price: 7200, accent: '#9ec77c',
    image_url: IMG.pickle_jar,
    description: 'Crunchy salt-pickled cucumbers in dill brine. 720g jar.' },
  { name: 'Adjika spicy paste', category: 'groceries', price: 5900, accent: '#e57b5a',
    image_url: IMG.adjika_jar,
    description: 'Hot Caucasian sauce with red pepper, garlic and herbs. 200g jar.' },
  { name: 'Condensed milk (Sgushchenka)', category: 'groceries', price: 5200, accent: '#e6d59b',
    image_url: IMG.eagle_milk_can,
    description: 'Sweetened condensed milk in classic blue-and-white tin. 380g.' },
  { name: 'Sprats in oil', category: 'groceries', price: 6300, accent: '#a8c0c9',
    image_url: IMG.eagle_milk_can,
    description: 'Smoked Baltic sprats in sunflower oil. 160g tin.' },
  { name: 'Doshirak instant noodles', category: 'groceries', price: 1800, accent: '#e8a072',
    image_url: IMG.doshirak_cup,
    description: 'Korean–Russian favourite instant noodles. Beef flavour. 90g cup.' },

  // ===== Dairy =====
  { name: 'Smetana 20%', category: 'dairy', price: 6900, accent: '#f1e9d0',
    image_url: IMG.sour_cream_tub,
    description: 'Thick Russian-style sour cream. Perfect for borscht. 400g cup.' },
  { name: 'Tvorog 9%', category: 'dairy', price: 7500, accent: '#f3edd8',
    image_url: IMG.twarog_tub,
    description: 'Fresh farmer\'s cheese, soft and crumbly. 500g pack.' },
  { name: 'Kefir 2.5%', category: 'dairy', price: 4800, accent: '#ecf0e3',
    image_url: IMG.borjomi_bottle,
    description: 'Fermented milk drink, lightly tart and refreshing. 1L bottle.' },
  { name: 'Ryazhenka 4%', category: 'dairy', price: 5200, accent: '#e8c79a',
    image_url: IMG.borjomi_bottle,
    description: 'Baked fermented milk with a warm caramel note. 500ml bottle.' },

  // ===== Drinks =====
  { name: 'Borjomi mineral water', category: 'drinks', price: 4500, accent: '#7dbef0',
    image_url: IMG.borjomi_bottle,
    description: 'Iconic Georgian sparkling mineral water. 500ml bottle.' },
  { name: 'Kvass "Ochakovsky"', category: 'drinks', price: 5800, accent: '#b88a4e',
    image_url: IMG.cranberry_bottle,
    description: 'Traditional rye kvass — slightly sweet, lightly fizzy. 1.5L bottle.' },
  { name: 'Mors (cranberry)', category: 'drinks', price: 5400, accent: '#d96a76',
    image_url: IMG.cranberry_bottle,
    description: 'Refreshing wild cranberry drink, no added flavours. 1L bottle.' },
  { name: 'Compote (assorted fruit)', category: 'drinks', price: 4900, accent: '#e8a48a',
    image_url: IMG.pickle_jar,
    description: 'Homestyle fruit compote with apples, plums and apricots. 1L jar.' },

  // ===== Sweets =====
  { name: 'Alenka chocolate bar', category: 'sweets', price: 3500, accent: '#c25a6c',
    image_url: IMG.alenka_bar,
    description: 'Legendary Russian milk chocolate bar. 100g bar.' },
  { name: 'Halva sunflower', category: 'sweets', price: 6200, accent: '#d6b079',
    image_url: IMG.alenka_bar,
    description: 'Crumbly sunflower halva — sweet and nutty. 300g pack.' },
  { name: 'Pryaniki (honey cakes)', category: 'sweets', price: 5800, accent: '#caa07a',
    image_url: IMG.pryaniki_box,
    description: 'Soft glazed honey-spice cakes — the original Russian gingerbread. 400g.' },
  { name: 'Zefir vanilla', category: 'sweets', price: 6700, accent: '#f3d8e2',
    image_url: IMG.alenka_bar,
    description: 'Cloud-like vanilla marshmallow treats. 250g pack.' },
  { name: 'Krasny Oktyabr candies', category: 'sweets', price: 7400, accent: '#e57676',
    image_url: IMG.alenka_bar,
    description: 'Assorted classic Soviet-era chocolate sweets. 300g pack.' },

  // ===== Bakery =====
  { name: 'Borodinsky black bread', category: 'bakery', price: 5400, accent: '#8a6240',
    image_url: IMG.rye_loaf,
    description: 'Dark rye bread with coriander. Perfect with smetana and herring. 500g loaf.' },
  { name: 'Baton (white loaf)', category: 'bakery', price: 4200, accent: '#e3c98e',
    image_url: IMG.baton_loaf,
    description: 'Soft Russian-style white loaf with a tender crumb. 400g.' },
  { name: 'Sushki (mini-bagels)', category: 'bakery', price: 4800, accent: '#d4ad6e',
    image_url: IMG.flour_bag,
    description: 'Small dry ring biscuits — perfect with tea. 300g pack.' },

  // ===== Meat & sausages — single clean cured-meat photo =====
  { name: 'Doctor sausage (Doktorskaya)', category: 'meat', price: 13500, accent: '#e0938e',
    image_url: IMG.krakowska_meat,
    description: 'Classic boiled "Doctor\'s" sausage, mild and delicate. 500g.' },
  { name: 'Salami "Moskovskaya"', category: 'meat', price: 16800, accent: '#b96655',
    image_url: IMG.krakowska_meat,
    description: 'Dry-cured beef salami with peppercorns. 300g stick.' },
  { name: 'Smoked sausage "Krakovskaya"', category: 'meat', price: 14900, accent: '#c87b5d',
    image_url: IMG.krakowska_meat,
    description: 'Hot-smoked pork sausage with garlic and pepper. 400g.' },
  { name: 'Salo (cured pork fat)', category: 'meat', price: 11200, accent: '#f0d6c2',
    image_url: IMG.salo_pack,
    description: 'Salt-cured pork fat with garlic. Best on black bread. 300g pack.' },

  // ===== Ready food — sealed deli containers =====
  { name: 'Olivier salad', category: 'ready', price: 8900, accent: '#cfd6a4',
    image_url: IMG.twarog_tub,
    description: 'House-made Olivier with bologna, peas, pickles and mayo. 500g deli pack.' },
  { name: 'Selyodka pod shuboi', category: 'ready', price: 9800, accent: '#c987a3',
    image_url: IMG.twarog_tub,
    description: 'Layered "herring under a fur coat" salad with beetroot. 500g deli pack.' },
  { name: 'Borscht (ready to heat)', category: 'ready', price: 9500, accent: '#c75858',
    image_url: IMG.pickle_jar,
    description: 'Rich beetroot soup with beef. Just heat and serve. 700g jar.' },
  { name: 'Holodets (meat aspic)', category: 'ready', price: 11800, accent: '#d6b894',
    image_url: IMG.twarog_tub,
    description: 'Traditional meat in jelly with garlic. Serve with mustard. 500g deli pack.' }
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
