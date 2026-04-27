require('dotenv').config();
const db = require('./database');

// Product photos are real packaged-product photographs hosted on Wikimedia
// Commons (upload.wikimedia.org). All CC-licensed, content-addressed thumbs
// at 960px wide, safe to hotlink. To swap any product for your own photo,
// drop the file into public/images/products/ and replace the image_url with
// '/images/products/<file>.jpg' — the card will display it via object-fit: contain.
const W = (path) => `https://upload.wikimedia.org/wikipedia/commons/${path}`;

// Reusable image references (multiple products visually share packaging type)
const IMG = {
  vkusvill_pelmeni: W('thumb/f/f1/Moscow%2C_Vkusvill_chicken_pelmeni_Feb.2025.jpg/960px-Moscow%2C_Vkusvill_chicken_pelmeni_Feb.2025.jpg'),
  flour_bag:        W('thumb/e/ee/A_nice_bag_of_wheat_flour%21.jpg/960px-A_nice_bag_of_wheat_flour%21.jpg'),
  halva_pack:       W('thumb/1/10/Halva_mini_bars_at_supermarket_checkout_%28cropped%29.jpg/960px-Halva_mini_bars_at_supermarket_checkout_%28cropped%29.jpg'),
  zimbo_salami:     W('thumb/a/a5/Salami_pepperoni_ZIMBO.jpg/960px-Salami_pepperoni_ZIMBO.jpg'),
  kefir_bottle:     W('thumb/7/7f/Kefir_Ariani_bottles_in_Greece.jpg/960px-Kefir_Ariani_bottles_in_Greece.jpg')
};

const products = [
  // ===== Frozen =====
  { name: 'Pelmeni "Sibirskie"', category: 'frozen', price: 12500, accent: '#9bc7ff',
    image_url: IMG.vkusvill_pelmeni,
    description: 'Classic Siberian dumplings with juicy beef and pork filling. 800g pack.' },
  { name: 'Vareniki s kartoshkoi', category: 'frozen', price: 9800, accent: '#a9d6ff',
    image_url: IMG.vkusvill_pelmeni,
    description: 'Soft dumplings with mashed potato and onion. Boil 6 minutes. 700g pack.' },
  { name: 'Bliny s tvorogom', category: 'frozen', price: 8500, accent: '#f4cf95',
    image_url: IMG.vkusvill_pelmeni,
    description: 'Thin Russian pancakes filled with sweet curd cheese. Frozen 500g pack.' },
  { name: 'Chebureki', category: 'frozen', price: 11200, accent: '#f3b97f',
    image_url: IMG.vkusvill_pelmeni,
    description: 'Crispy fried turnovers with seasoned beef. Frozen 600g, 6 pcs.' },

  // ===== Groceries =====
  { name: 'Grechka (Buckwheat groats)', category: 'groceries', price: 6800, accent: '#caa472',
    image_url: IMG.flour_bag,
    description: 'Premium roasted buckwheat. The classic Russian side dish. 900g bag.' },
  { name: 'Buckwheat flour', category: 'groceries', price: 5400, accent: '#d6b889',
    image_url: IMG.flour_bag,
    description: 'Stone-ground buckwheat flour for blini and pancakes. 1kg bag.' },
  { name: 'Pickled cucumbers', category: 'groceries', price: 7200, accent: '#9ec77c',
    image_url: W('thumb/5/50/A_jar_of_sliced_pickled_cucumber.jpg/960px-A_jar_of_sliced_pickled_cucumber.jpg'),
    description: 'Crunchy salt-pickled cucumbers in dill brine. 720g jar.' },
  { name: 'Adjika spicy paste', category: 'groceries', price: 5900, accent: '#e57b5a',
    image_url: W('thumb/e/e9/Adjika_in_a_can.jpg/960px-Adjika_in_a_can.jpg'),
    description: 'Hot Caucasian sauce with red pepper, garlic and herbs. 200g jar.' },
  { name: 'Sunflower seeds', category: 'groceries', price: 4500, accent: '#d6b04c',
    image_url: W('1/1a/Sunflower_Seed_Products_bulk_and_packaged_%2826787612871%29.jpg'),
    description: 'Roasted black sunflower seeds, lightly salted. 300g pack.' },
  { name: 'Condensed milk (Sgushchenka)', category: 'groceries', price: 5200, accent: '#e6d59b',
    image_url: W('thumb/1/1b/Cans_of_Condensed_Milk_on_the_store_shelf.jpg/960px-Cans_of_Condensed_Milk_on_the_store_shelf.jpg'),
    description: 'Sweetened condensed milk in classic blue-and-white tin. 380g.' },
  { name: 'Doshirak instant noodles', category: 'groceries', price: 1800, accent: '#e8a072',
    image_url: W('thumb/9/95/Paldo_Dosirac_noodles_20210605_002.jpg/960px-Paldo_Dosirac_noodles_20210605_002.jpg'),
    description: 'Korean–Russian favourite instant noodles. Beef flavour. 90g cup.' },
  { name: 'Sprats in oil', category: 'groceries', price: 6300, accent: '#a8c0c9',
    image_url: W('thumb/f/f4/Sardine-tins.jpg/960px-Sardine-tins.jpg'),
    description: 'Smoked Baltic sprats in sunflower oil. 160g tin.' },

  // ===== Dairy =====
  { name: 'Smetana 20%', category: 'dairy', price: 6900, accent: '#f1e9d0',
    image_url: W('thumb/4/46/Moscow%2C_Aug.2025_-_Pyatyorochka_private-label_sour_cream_01.jpg/960px-Moscow%2C_Aug.2025_-_Pyatyorochka_private-label_sour_cream_01.jpg'),
    description: 'Thick Russian-style sour cream. Perfect for borscht. 400g cup.' },
  { name: 'Tvorog 9%', category: 'dairy', price: 7500, accent: '#f3edd8',
    image_url: W('thumb/3/3b/Twarog_packaged.JPG/960px-Twarog_packaged.JPG'),
    description: 'Fresh farmer\'s cheese, soft and crumbly. 500g pack.' },
  { name: 'Kefir 2.5%', category: 'dairy', price: 4800, accent: '#ecf0e3',
    image_url: IMG.kefir_bottle,
    description: 'Fermented milk drink, lightly tart and refreshing. 1L bottle.' },
  { name: 'Ryazhenka 4%', category: 'dairy', price: 5200, accent: '#e8c79a',
    image_url: IMG.kefir_bottle,
    description: 'Baked fermented milk with a warm caramel note. 500ml bottle.' },

  // ===== Drinks =====
  { name: 'Borjomi mineral water', category: 'drinks', price: 4500, accent: '#7dbef0',
    image_url: W('1/15/Borjomi_Bottle_0.5L_PET.jpg'),
    description: 'Iconic Georgian sparkling mineral water. 500ml bottle.' },
  { name: 'Kvass "Ochakovsky"', category: 'drinks', price: 5800, accent: '#b88a4e',
    image_url: W('9/9c/Kvass_being_sold_in_the_streets_of_Kaliningrad.jpg'),
    description: 'Traditional rye kvass — slightly sweet, lightly fizzy. 1.5L bottle.' },
  { name: 'Mors (cranberry)', category: 'drinks', price: 5400, accent: '#d96a76',
    image_url: W('thumb/8/83/Lifetothefullest_cranberry_juice_bottle%2C_Hillegersberg%2C_Rotterdam_%282022%29_04.jpg/960px-Lifetothefullest_cranberry_juice_bottle%2C_Hillegersberg%2C_Rotterdam_%282022%29_04.jpg'),
    description: 'Refreshing wild cranberry drink, no added flavours. 1L bottle.' },
  { name: 'Compote (assorted fruit)', category: 'drinks', price: 4900, accent: '#e8a48a',
    image_url: W('thumb/6/64/Peach_compote_in_a_jar.jpg/960px-Peach_compote_in_a_jar.jpg'),
    description: 'Homestyle fruit compote with apples, plums and apricots. 1L jar.' },

  // ===== Sweets =====
  { name: 'Alenka chocolate bar', category: 'sweets', price: 3500, accent: '#c25a6c',
    image_url: W('thumb/e/e1/Alenka_chocolate_2.JPG/960px-Alenka_chocolate_2.JPG'),
    description: 'Legendary Russian milk chocolate bar. 100g bar.' },
  { name: 'Halva sunflower', category: 'sweets', price: 6200, accent: '#d6b079',
    image_url: IMG.halva_pack,
    description: 'Crumbly sunflower halva — sweet and nutty. 300g pack.' },
  { name: 'Pryaniki (honey cakes)', category: 'sweets', price: 5800, accent: '#caa07a',
    image_url: W('thumb/e/ea/Dutch_style_gingerbread_load%2C_German_packaging.jpg/960px-Dutch_style_gingerbread_load%2C_German_packaging.jpg'),
    description: 'Soft glazed honey-spice cakes — the original Russian gingerbread. 400g.' },
  { name: 'Zefir vanilla', category: 'sweets', price: 6700, accent: '#f3d8e2',
    image_url: IMG.halva_pack,
    description: 'Cloud-like vanilla marshmallow treats. 250g pack.' },
  { name: 'Krasny Oktyabr candies', category: 'sweets', price: 7400, accent: '#e57676',
    image_url: W('thumb/0/0a/Russian_chocolate_konfect_07.JPG/960px-Russian_chocolate_konfect_07.JPG'),
    description: 'Assorted classic Soviet-era chocolate sweets. 300g pack.' },

  // ===== Bakery =====
  { name: 'Borodinsky black bread', category: 'bakery', price: 5400, accent: '#8a6240',
    image_url: W('thumb/1/1f/Roggenbrot-Laib_Loaf-rye-bread.JPG/960px-Roggenbrot-Laib_Loaf-rye-bread.JPG'),
    description: 'Dark rye bread with coriander. Perfect with smetana and herring. 500g loaf.' },
  { name: 'Baton (white loaf)', category: 'bakery', price: 4200, accent: '#e3c98e',
    image_url: W('thumb/a/ad/%D0%91%D0%B0%D1%82%D0%BE%D0%BD_%D0%A1%D0%BB%D0%BE%D0%B1%D0%BE%D0%B6%D0%B0%D0%BD%D1%81%D0%BA%D0%B8%D0%B9_%D0%A5%D0%B0%D1%80%D1%8C%D0%BA%D0%BE%D0%B2.JPG/960px-%D0%91%D0%B0%D1%82%D0%BE%D0%BD_%D0%A1%D0%BB%D0%BE%D0%B1%D0%BE%D0%B6%D0%B0%D0%BD%D1%81%D0%BA%D0%B8%D0%B9_%D0%A5%D0%B0%D1%80%D1%8C%D0%BA%D0%BE%D0%B2.JPG'),
    description: 'Soft Russian-style white loaf with a tender crumb. 400g.' },
  { name: 'Sushki (mini-bagels)', category: 'bakery', price: 4800, accent: '#d4ad6e',
    image_url: IMG.halva_pack,
    description: 'Small dry ring biscuits — perfect with tea. 300g pack.' },

  // ===== Meat & sausages =====
  { name: 'Doctor sausage (Doktorskaya)', category: 'meat', price: 13500, accent: '#e0938e',
    image_url: IMG.zimbo_salami,
    description: 'Classic boiled "Doctor\'s" sausage, mild and delicate. 500g.' },
  { name: 'Salami "Moskovskaya"', category: 'meat', price: 16800, accent: '#b96655',
    image_url: IMG.zimbo_salami,
    description: 'Dry-cured beef salami with peppercorns. 300g stick.' },
  { name: 'Smoked sausage "Krakovskaya"', category: 'meat', price: 14900, accent: '#c87b5d',
    image_url: W('thumb/8/81/Krakowska_brand_dry_polish_sausage_sucha.jpg/960px-Krakowska_brand_dry_polish_sausage_sucha.jpg'),
    description: 'Hot-smoked pork sausage with garlic and pepper. 400g.' },
  { name: 'Salo (cured pork fat)', category: 'meat', price: 11200, accent: '#f0d6c2',
    image_url: W('thumb/1/1d/Salo_with_pepper_closeup.jpg/960px-Salo_with_pepper_closeup.jpg'),
    description: 'Salt-cured pork fat with garlic. Best on black bread. 300g pack.' },

  // ===== Ready food =====
  { name: 'Olivier salad', category: 'ready', price: 8900, accent: '#cfd6a4',
    image_url: W('thumb/f/f2/Waldorf_deli_salad.jpg/960px-Waldorf_deli_salad.jpg'),
    description: 'House-made Olivier with bologna, peas, pickles and mayo. 500g deli pack.' },
  { name: 'Selyodka pod shuboi', category: 'ready', price: 9800, accent: '#c987a3',
    image_url: W('thumb/6/6a/Selyodka_pod_Shuboy_at_White_Nights%2C_Beijing_%2820201023130349%29.jpg/960px-Selyodka_pod_Shuboy_at_White_Nights%2C_Beijing_%2820201023130349%29.jpg'),
    description: 'Layered "herring under a fur coat" salad with beetroot. 500g deli pack.' },
  { name: 'Borscht (ready to heat)', category: 'ready', price: 9500, accent: '#c75858',
    image_url: W('thumb/d/d8/Manischewitz_-_Borscht.jpg/960px-Manischewitz_-_Borscht.jpg'),
    description: 'Rich beetroot soup with beef. Just heat and serve. 700g jar.' },
  { name: 'Holodets (meat aspic)', category: 'ready', price: 11800, accent: '#d6b894',
    image_url: W('e/e1/Aspic-with-eggs.jpg'),
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
