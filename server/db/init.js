const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

// Delete existing DB if present
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('🗑️  Removed existing database');
}

console.log('📦 Creating database...');

const data = {
  users: [],
  categories: [],
  products: [],
  product_images: [],
  cart_items: [],
  orders: [],
  order_items: [],
  counters: { users: 0, categories: 0, products: 0, product_images: 0, cart_items: 0, orders: 0, order_items: 0 }
};

let id;

// --- Users ---
id = ++data.counters.users;
data.users.push({ id, name: 'John Doe', email: 'john@example.com', created_at: new Date().toISOString() });

// --- Categories ---
const cats = [
  ['Electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'],
  ['Books', 'books', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'],
  ['Clothing', 'clothing', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'],
  ['Home & Kitchen', 'home-kitchen', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'],
  ['Sports & Outdoors', 'sports-outdoors', 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcbc7?w=400'],
  ['Beauty & Personal Care', 'beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'],
];
cats.forEach(([name, slug, image_url]) => {
  id = ++data.counters.categories;
  data.categories.push({ id, name, slug, image_url });
});

// --- Products ---
const products = [
  // Electronics (1)
  ['Sony WH-1000XM5 Wireless Noise Cancelling Headphones', 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones. Up to 30 hours of battery life with quick charging.', 'Driver: 30mm | Frequency: 4Hz-40kHz | Battery: 30hrs | Weight: 250g | Bluetooth: 5.2 | NFC: Yes', 299.99, 399.99, 45, 1, 4.5, 12847],
  ['Apple MacBook Air 15" M3 Chip', 'Supercharged by M3 chip. 15.3-inch Liquid Retina display. Up to 18 hours of battery life. Fanless design for silent operation.', 'Chip: Apple M3 | RAM: 8GB | Storage: 256GB SSD | Display: 15.3" Liquid Retina | Battery: 18hrs | Weight: 1.51kg', 1299.00, 1499.00, 20, 1, 4.7, 3241],
  ['Samsung Galaxy S24 Ultra 256GB', 'Galaxy AI is here. Titanium frame with 6.8" Dynamic AMOLED 2X display. 200MP camera with AI-enhanced photography.', 'Display: 6.8" QHD+ | Processor: Snapdragon 8 Gen 3 | RAM: 12GB | Storage: 256GB | Camera: 200MP | Battery: 5000mAh', 1199.99, 1319.99, 35, 1, 4.4, 8934],
  ['Apple AirPods Pro (2nd Generation)', 'Active Noise Cancellation up to 2x more effective. Adaptive Transparency. Personalized Spatial Audio. MagSafe charging case.', 'Driver: Apple H2 | ANC: Yes | Battery: 6hrs (30hrs with case) | Water Resistant: IPX4 | Weight: 5.3g each', 249.00, 279.00, 100, 1, 4.6, 45231],
  ['LG C3 55" 4K OLED Smart TV', 'Self-lit OLED pixels create perfect blacks and over a billion colors. Dolby Vision, Dolby Atmos, and Filmmaker Mode.', 'Display: 55" 4K OLED | HDR: Dolby Vision, HDR10, HLG | Refresh: 120Hz | HDMI: 4x 2.1 | Smart TV: webOS 23', 1296.99, 1799.99, 15, 1, 4.6, 6712],
  ['Logitech MX Master 3S Wireless Mouse', 'Precision sensor tracks on any surface including glass. Quiet clicks with MagSpeed scroll wheel. USB-C quick charging.', 'Sensor: 8000 DPI | Battery: 70 days | Connectivity: Bluetooth, USB | Weight: 141g | Buttons: 7', 99.99, 109.99, 80, 1, 4.5, 15432],
  ['JBL Charge 5 Portable Bluetooth Speaker', 'Bold JBL Original Pro Sound with deep bass. Built-in powerbank. IP67 waterproof and dustproof. 20 hours of playtime.', 'Power: 40W | Battery: 20hrs | Waterproof: IP67 | Bluetooth: 5.1 | Weight: 960g | USB-C', 179.95, 189.95, 60, 1, 4.7, 28901],
  // Books (2)
  ['Atomic Habits by James Clear', 'Proven framework for improving every day. Practical strategies for forming good habits and breaking bad ones.', 'Pages: 320 | Publisher: Avery | Language: English | ISBN: 978-0735211292 | Format: Paperback', 11.98, 16.99, 200, 2, 4.8, 98432],
  ['The Psychology of Money by Morgan Housel', 'Timeless lessons on wealth, greed, and happiness. 19 short stories exploring the strange ways people think about money.', 'Pages: 256 | Publisher: Harriman House | Language: English | ISBN: 978-0857197689 | Format: Paperback', 14.99, 19.99, 150, 2, 4.7, 67234],
  ['System Design Interview by Alex Xu', 'Covers system design questions asked in large-scale distributed system interviews. Step-by-step framework.', 'Pages: 322 | Publisher: Byte Code LLC | Language: English | ISBN: 978-1736049105 | Format: Paperback', 33.99, 39.99, 80, 2, 4.6, 12456],
  ['Clean Code by Robert C. Martin', 'A Handbook of Agile Software Craftsmanship. If code is not clean, it can bring development to its knees.', 'Pages: 464 | Publisher: Pearson | Language: English | ISBN: 978-0132350884 | Format: Paperback', 34.89, 49.99, 65, 2, 4.4, 8901],
  ['Dune by Frank Herbert', 'Set on the desert planet Arrakis, the story of Paul Atreides and a great family ambition.', 'Pages: 688 | Publisher: Ace | Language: English | ISBN: 978-0441172719 | Format: Mass Market Paperback', 9.99, 12.99, 300, 2, 4.7, 45678],
  // Clothing (3)
  ['Nike Air Max 270 Mens Running Shoes', 'Visible Air cushioning and an ultra-comfortable fit. Biggest heel Air unit for a super-soft ride.', 'Material: Mesh upper | Sole: Rubber | Cushioning: Air Max 270 | Closure: Lace-up | Style: Casual', 129.99, 159.99, 40, 3, 4.3, 23456],
  ['Levis 501 Original Fit Jeans', 'The original jean. Sits at the waist with a regular fit through the thigh. Button fly. 100% cotton.', 'Material: 100% Cotton | Fit: Regular | Rise: Mid | Closure: Button Fly | Wash: Stonewash', 49.50, 69.50, 90, 3, 4.4, 34567],
  ['The North Face Thermoball Eco Jacket', 'Lightweight synthetic insulated jacket with recycled materials. ThermoBall Eco insulation.', 'Material: Recycled Polyester | Insulation: ThermoBall Eco | Water Resistant: DWR | Weight: 380g', 199.00, 230.00, 25, 3, 4.6, 8923],
  ['Adidas Ultraboost Light Running Shoes', 'Epic energy with 30% Light BOOST cushioning. Continental Rubber outsole for grip.', 'Material: Primeknit upper | Sole: Continental Rubber | Cushioning: BOOST | Drop: 10mm', 189.99, 199.99, 55, 3, 4.5, 19876],
  ['Calvin Klein Classic Fit Dress Shirt', 'Refined non-iron cotton dress shirt. Regular fit with spread collar and button cuffs.', 'Material: 100% Cotton | Fit: Regular | Collar: Spread | Care: Non-Iron | Style: Dress', 39.99, 59.99, 120, 3, 4.2, 5678],
  // Home & Kitchen (4)
  ['Instant Pot Duo 7-in-1 Electric Pressure Cooker', '7 appliances in 1: pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt, warmer.', 'Capacity: 6 Qt | Power: 1000W | Programs: 13 | Material: Stainless Steel | Dishwasher Safe: Yes', 89.95, 109.95, 70, 4, 4.7, 156789],
  ['Dyson V15 Detect Cordless Vacuum', 'Most powerful cordless vacuum. Laser reveals microscopic dust. Piezo sensor counts particles.', 'Power: 230 AW | Battery: 60 min | Weight: 6.8 lbs | Bin: 0.2 gal | Filtration: HEPA', 649.99, 749.99, 18, 4, 4.5, 12345],
  ['KitchenAid Artisan Series 5-Qt Stand Mixer', 'Iconic stand mixer with 10 speeds. Planetary mixing action. 5-quart stainless bowl.', 'Capacity: 5 Qt | Power: 325W | Speeds: 10 | Color: Empire Red | Weight: 26 lbs', 349.99, 449.99, 22, 4, 4.8, 89012],
  ['Nespresso Vertuo Next Coffee Machine', 'Brews 5 cup sizes using Centrifusion technology. One-button operation. 12 welcome capsules.', 'Pump: 19 bar | Water Tank: 37 oz | Sizes: 5 | Heat-up: 30 sec', 159.00, 209.00, 40, 4, 4.3, 23456],
  ['iRobot Roomba j7+ Self-Emptying Robot Vacuum', 'Identifies obstacles. Clean Base empties itself for 60 days. Smart mapping learns your home.', 'Suction: 10x | Battery: 75 min | Navigation: PrecisionVision | WiFi: Yes | Alexa: Yes', 599.99, 799.99, 12, 4, 4.4, 34567],
  // Sports (5)
  ['YETI Rambler 36 oz Bottle', 'Keeps water ice-cold or coffee hot. 18/8 stainless steel with double-wall vacuum insulation.', 'Capacity: 36 oz | Material: 18/8 Stainless Steel | Insulation: Double-wall Vacuum | BPA Free: Yes', 45.00, 50.00, 95, 5, 4.8, 45678],
  ['Fitbit Charge 6 Fitness Tracker', 'Advanced health tracker with built-in GPS. Heart rate, sleep, stress tracking. 7-day battery.', 'Display: AMOLED | Battery: 7 days | GPS: Built-in | Water Resistant: 50m | Sensors: SpO2, ECG', 159.95, 179.95, 50, 5, 4.3, 12345],
  ['Coleman Sundome 4-Person Tent', 'Easy setup dome tent. WeatherTec system. Fits 1 queen airbed. Great for car camping.', 'Capacity: 4 Person | Dimensions: 9x7 ft | Height: 4.11 ft | Weight: 9.1 lbs | Seasons: 3', 79.99, 119.99, 30, 5, 4.4, 23456],
  ['Bowflex SelectTech 552 Adjustable Dumbbells', 'Replace 15 sets of weights with unique dial system. 5 to 52.5 lbs in 2.5 lb increments.', 'Weight: 5-52.5 lbs | Increments: 2.5 lbs | Length: 16.9" | Material: Steel/Nylon', 349.00, 429.00, 15, 5, 4.6, 8901],
  ['Hydro Flask 32 oz Wide Mouth Water Bottle', 'TempShield insulation. Cold 24 hours, hot 12 hours. BPA-free. Lifetime warranty.', 'Capacity: 32 oz | Material: 18/8 Stainless Steel | Insulation: TempShield | BPA Free: Yes', 44.95, 49.95, 110, 5, 4.7, 56789],
  // Beauty (6)
  ['Dyson Airwrap Multi-Styler Complete', 'Multiple hair types and styles. Coanda air styling and drying. 6 attachments included.', 'Power: 1300W | Heat Settings: 3 | Airflow: 3 | Attachments: 6 | Voltage: 110V', 499.99, 599.99, 20, 6, 4.4, 23456],
  ['CeraVe Moisturizing Cream 19 oz', 'Developed with dermatologists. 3 essential ceramides and hyaluronic acid. 24-hour hydration.', 'Size: 19 oz | Skin Type: All | Key Ingredients: Ceramides | Fragrance: Free', 16.99, 21.99, 200, 6, 4.7, 89012],
  ['Oral-B iO Series 9 Electric Toothbrush', 'Micro-vibration technology. AI-powered 3D tracking. Interactive display. 7 cleaning modes.', 'Modes: 7 | Battery: 14 days | Timer: 2 min | Pressure Sensor: Yes | Charger: Magnetic', 249.99, 329.99, 35, 6, 4.5, 12345],
  ['La Roche-Posay Anthelios Sunscreen SPF 60', 'Lightweight sunscreen with Cell-Ox Shield. Water resistant 80 min. Oil-free. Sensitive skin.', 'SPF: 60 | Size: 1.7 fl oz | Water Resistant: 80 min | Oil-Free: Yes | PA: ++++', 29.99, 35.99, 150, 6, 4.6, 34567],
  ['Philips Norelco OneBlade Face + Body', 'Trim, edge, shave any length. Dual-sided blade for face and body. Wet and dry use.', 'Blades: 3 | Battery: 60 min | Charge: 4 hrs | Water Resistant: Yes | Combs: 4', 49.96, 64.96, 75, 6, 4.3, 45678],
];

products.forEach(([name, description, specifications, price, original_price, stock, category_id, rating, review_count]) => {
  id = ++data.counters.products;
  data.products.push({
    id, name, description, specifications, price, original_price,
    stock, category_id, rating, review_count,
    created_at: new Date().toISOString(),
  });
});

// --- Product Images ---
const images = [
  [1, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600', 1],
  [1, 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600', 2],
  [1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 3],
  [2, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', 1],
  [2, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600', 2],
  [2, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600', 3],
  [3, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600', 1],
  [3, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600', 2],
  [3, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', 3],
  [4, 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600', 1],
  [4, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600', 2],
  [5, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600', 1],
  [5, 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600', 2],
  [6, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600', 1],
  [6, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600', 2],
  [7, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600', 1],
  [7, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600', 2],
  [8, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600', 1],
  [8, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', 2],
  [9, 'https://images.unsplash.com/photo-1554244933-d876deb6b2ff?w=600', 1],
  [9, 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600', 2],
  [10, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600', 1],
  [11, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600', 1],
  [12, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600', 1],
  [13, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 1],
  [13, 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600', 2],
  [14, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', 1],
  [14, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600', 2],
  [15, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', 1],
  [16, 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600', 1],
  [16, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', 2],
  [17, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600', 1],
  [18, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600', 1],
  [19, 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600', 1],
  [20, 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600', 1],
  [21, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600', 1],
  [21, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600', 2],
  [22, 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600', 1],
  [23, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600', 1],
  [24, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600', 1],
  [24, 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600', 2],
  [25, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600', 1],
  [26, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600', 1],
  [27, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600', 1],
  [28, 'https://images.unsplash.com/photo-1522338242992-e1a54571e8cc?w=600', 1],
  [28, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600', 2],
  [29, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600', 1],
  [30, 'https://images.unsplash.com/photo-1559590523-d1dbbab12cd3?w=600', 1],
  [31, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', 1],
  [32, 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600', 1],
];

images.forEach(([product_id, image_url, display_order]) => {
  id = ++data.counters.product_images;
  data.product_images.push({ id, product_id, image_url, display_order });
});

// Save
fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

console.log(`✅ Seeded ${data.users.length} user, ${data.categories.length} categories, ${data.products.length} products, ${data.product_images.length} images`);
console.log('🚀 Database initialization complete!');
