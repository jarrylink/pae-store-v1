/**
 * add-africell-products.cjs
 * 
 * Appends 11 new Africell solar products to the existing database catalog.
 * (Preserves all existing products in the "Product" table).
 */

const { neon } = require('@neondatabase/serverless');

const isDryRun = process.argv.includes('--dry-run');

const africellProducts = [
  // LITHIUM BATTERIES
  {
    title: 'Africell 5 kWh 24 V Lithium Battery',
    brand: 'Africell',
    spec: '5kWh 24V LiFePO4 Wall Mounted Lithium Battery, Built-in BMS',
    price: 935000,
    category: 'Lithium Battery',
    warranty: '5-Year Warranty',
    installationTime: '2-3 Hours',
    capacity: '5kWh',
    systemType: 'Energy Storage',
    compatibleWith: ['24V Inverter Systems', 'Solar Energy Systems', 'Hybrid Inverters'],
    features: [
      '5kWh / 24V LiFePO4 Chemistry',
      'Compact Wall-Mount Design',
      'Built-in Intelligent BMS',
      '6,000+ Deep Cycles',
      'High Discharge Efficiency'
    ],
    image: 'https://solarvillage.africa/media/catalog/product/cache/74538e62df17dd01277a0fd8537c19ca/5/k/5khw_pic_1.jpg',
    inStock: true,
    inventory: 15,
    purchasePrice: 750000,
    vendorPrice: 830000,
    expenses: 0
  },
  {
    title: 'Africell 5 kWh 48 V Lithium Battery',
    brand: 'Africell',
    spec: '5kWh 48V (51.2V nominal) LiFePO4 Wall Mounted Lithium Battery, Built-in BMS',
    price: 946000,
    category: 'Lithium Battery',
    warranty: '5-Year Warranty',
    installationTime: '2-3 Hours',
    capacity: '5kWh',
    systemType: 'Energy Storage',
    compatibleWith: ['48V Hybrid Inverters', 'Solar Energy Systems', 'Off-Grid / On-Grid'],
    features: [
      '51.2V Nominal Voltage',
      'LiFePO4 Safe Chemistry',
      'Intelligent Battery Protection System',
      'Wall Mounted Setup',
      'High Thermal Stability'
    ],
    image: 'https://solarvillage.africa/media/catalog/product/cache/74538e62df17dd01277a0fd8537c19ca/5/k/5khw_pic_1.jpg',
    inStock: true,
    inventory: 15,
    purchasePrice: 760000,
    vendorPrice: 840000,
    expenses: 0
  },
  {
    title: 'Africell 10 kWh 48 V Lithium Battery',
    brand: 'Africell',
    spec: '10kWh 48V LiFePO4 High Capacity Wall Mounted Lithium Battery',
    price: 1463000,
    category: 'Lithium Battery',
    warranty: '5-Year Warranty',
    installationTime: '3-4 Hours',
    capacity: '10kWh',
    systemType: 'Energy Storage',
    compatibleWith: ['48V Hybrid Inverters', 'Residential & Commercial Solar', 'Parallel Scalable'],
    features: [
      '10kWh / 200Ah Capacity',
      '90% Depth of Discharge',
      'Integrated Smart BMS with LCD Screen',
      'Wall Mounted Heavy-Duty Enclosure',
      'Long Lifespan >6,000 Cycles'
    ],
    image: 'https://solarvillage.africa/media/catalog/product/cache/74538e62df17dd01277a0fd8537c19ca/1/0/10kwh_pic1.jpg',
    inStock: true,
    inventory: 12,
    purchasePrice: 1180000,
    vendorPrice: 1300000,
    expenses: 0
  },
  {
    title: 'Africell 15 kWh 48 V Lithium Battery',
    brand: 'Africell',
    spec: '15kWh 48V LiFePO4 Heavy-Duty Wall Mounted Solar Energy Storage Battery',
    price: 1683000,
    category: 'Lithium Battery',
    warranty: '5-Year Warranty',
    installationTime: '3-5 Hours',
    capacity: '15kWh',
    systemType: 'Energy Storage',
    compatibleWith: ['48V Hybrid Inverters', 'Commercial & Large Residential Systems'],
    features: [
      '15kWh / 300Ah Massive Capacity',
      'Industrial-Grade Wall Mounting',
      'High Current Charge/Discharge Tolerance',
      'Integrated Smart BMS',
      'Multi-Unit Parallel Support'
    ],
    image: 'https://solarvillage.africa/media/catalog/product/cache/74538e62df17dd01277a0fd8537c19ca/2/0/2024111112253534-800x800.jpg',
    inStock: true,
    inventory: 8,
    purchasePrice: 1360000,
    vendorPrice: 1490000,
    expenses: 0
  },
  {
    title: 'Africell 17.5 kWh 48 V Lithium Battery',
    brand: 'Africell',
    spec: '17.5kWh 48V High-Density LiFePO4 Wall Mounted Solar Lithium Battery',
    price: 1925000,
    category: 'Lithium Battery',
    warranty: '5-Year Warranty',
    installationTime: '3-5 Hours',
    capacity: '17.5kWh',
    systemType: 'Energy Storage',
    compatibleWith: ['48V Hybrid Inverters', 'Large Residential Estates & Commercial Facilities'],
    features: [
      '17.5kWh Maximum Energy Storage',
      'Premium Prismatic LiFePO4 Cells',
      'Advanced Dual-BMS Protection',
      'High Energy Density Wall Form Factor',
      'Extended 6,000+ Cycle Life'
    ],
    image: 'https://solarvillage.africa/media/catalog/product/cache/74538e62df17dd01277a0fd8537c19ca/5/k/5khw_pic_1_1.jpg',
    inStock: true,
    inventory: 8,
    purchasePrice: 1550000,
    vendorPrice: 1710000,
    expenses: 0
  },

  // HYBRID INVERTERS
  {
    title: 'Africell 11 kVA 48 V Hybrid Inverter',
    brand: 'Africell',
    spec: '11kVA 48V Pure Sine Wave Hybrid Solar Inverter with High-Capacity MPPT',
    price: 715000,
    category: 'Hybrid Inverter',
    warranty: '2-Year Warranty',
    installationTime: '4-6 Hours',
    capacity: '11kVA',
    systemType: 'Hybrid',
    compatibleWith: ['48V Lithium / Lead-Acid Battery Banks', 'High-Output PV Solar Arrays', 'Mains & Generator'],
    features: [
      '11kVA Heavy-Duty Surge Output',
      'Built-in High-Efficiency MPPT Controller',
      'Pure Sine Wave AC Output',
      'Dual AC Outputs for Smart Load Management',
      'Wi-Fi / GPRS Remote Monitoring'
    ],
    image: 'https://solarvillage.africa/media/catalog/product/cache/74538e62df17dd01277a0fd8537c19ca/6/k/6k002.jpg',
    inStock: true,
    inventory: 10,
    purchasePrice: 570000,
    vendorPrice: 635000,
    expenses: 0
  },
  {
    title: 'Africell 6.2 kVA 48 V Hybrid Inverter',
    brand: 'Africell',
    spec: '6.2kVA 48V Smart Hybrid Solar Inverter with Integrated MPPT Controller',
    price: 385000,
    category: 'Hybrid Inverter',
    warranty: '2-Year Warranty',
    installationTime: '3-5 Hours',
    capacity: '6.2kVA',
    systemType: 'Hybrid',
    compatibleWith: ['48V Battery Systems', 'Solar Panels', 'Generator & Grid Input'],
    features: [
      '6.2kVA Continuous Output',
      'Wide MPPT Voltage Range',
      'Intelligent RGB Status Lighting',
      'Zero-Transfer Time Backup',
      'Customizable Charging Priority (Solar/Utility)'
    ],
    image: 'https://solarvillage.africa/media/catalog/product/cache/74538e62df17dd01277a0fd8537c19ca/6/k/6kwatt24_2.jpg',
    inStock: true,
    inventory: 15,
    purchasePrice: 308000,
    vendorPrice: 342000,
    expenses: 0
  },
  {
    title: 'Africell 4.2 kVA 24 V Hybrid Inverter',
    brand: 'Africell',
    spec: '4.2kVA 24V Pure Sine Wave Hybrid Solar Inverter with MPPT Solar Charger',
    price: 308000,
    category: 'Hybrid Inverter',
    warranty: '2-Year Warranty',
    installationTime: '3-4 Hours',
    capacity: '4.2kVA',
    systemType: 'Hybrid',
    compatibleWith: ['24V Battery Systems', 'Residential Solar Panels', 'Mains / Generator'],
    features: [
      '4.2kVA Continuous AC Output',
      'Integrated MPPT Solar Controller',
      'Compact Wall-Mount Chassis',
      'High Surge Capacity for Refrigeration & Pumps',
      'Clear LCD User Interface'
    ],
    image: 'https://solarvillage.africa/media/catalog/product/cache/74538e62df17dd01277a0fd8537c19ca/4/k/4kwatt.jpg',
    inStock: true,
    inventory: 15,
    purchasePrice: 246000,
    vendorPrice: 273000,
    expenses: 0
  },

  // MONOCRYSTALLINE SOLAR PANELS
  {
    title: 'Africell 350 W Monocrystalline Solar Panel',
    brand: 'Africell',
    spec: '350W High-Efficiency Monocrystalline Silicon Solar PV Module',
    price: 71500,
    category: 'Solar Panel',
    warranty: '12-Year Warranty',
    installationTime: '1-2 Hours',
    capacity: '350W',
    systemType: 'Solar PV',
    compatibleWith: ['12V/24V/48V Solar Systems', 'Residential Rooftops', 'All Inverters & Charge Controllers'],
    features: [
      'High-Purity Monocrystalline Silicon Cells',
      'Multi-Busbar Technology for Reduced Resistance',
      'Anti-Reflective Tempered Glass',
      'Corrosion-Resistant Anodized Aluminum Frame',
      '25-Year Linear Power Warranty'
    ],
    image: 'https://solarvillage.africa/media/catalog/product/cache/74538e62df17dd01277a0fd8537c19ca/3/5/350watt_mono_1_1.jpg',
    inStock: true,
    inventory: 50,
    purchasePrice: 57000,
    vendorPrice: 63000,
    expenses: 0
  },
  {
    title: 'Africell 550 W Monocrystalline Solar Panel',
    brand: 'Africell',
    spec: '550W High-Output Monocrystalline PERC Solar PV Module',
    price: 117700,
    category: 'Solar Panel',
    warranty: '12-Year Warranty',
    installationTime: '1-2 Hours',
    capacity: '550W',
    systemType: 'Solar PV',
    compatibleWith: ['High-Voltage Solar Arrays', 'Commercial & Residential Installs', 'Hybrid Inverters'],
    features: [
      'Half-Cut Cell Technology for Reduced Hot Spots',
      'High Conversion Efficiency (>21.3%)',
      'Excellent Low-Irradiance Performance',
      'IP68 Weatherproof Junction Box',
      '25-Year Linear Power Output Guarantee'
    ],
    image: 'https://solarvillage.africa/media/catalog/product/cache/10bedb2c8c91d9c1d5fe1a733b38e815/a/n/annotation_2024-11-14_114633.jpg',
    inStock: true,
    inventory: 50,
    purchasePrice: 94000,
    vendorPrice: 104000,
    expenses: 0
  },
  {
    title: 'Africell 650 W Monocrystalline Solar Panel',
    brand: 'Africell',
    spec: '650W Ultra High-Power Monocrystalline Half-Cell Solar PV Module',
    price: 121000,
    category: 'Solar Panel',
    warranty: '12-Year Warranty',
    installationTime: '1-2 Hours',
    capacity: '650W',
    systemType: 'Solar PV',
    compatibleWith: ['Utility-Scale & Commercial Rooftops', 'High-Yield Residential Solar Systems'],
    features: [
      'Massive 650W Output per Panel',
      'Bifacial / High-Density Half-Cut Cells',
      'Superior Temperature Coefficient',
      'Heavy-Duty 35mm Anodized Frame (5400Pa Snow / 2400Pa Wind)',
      '30-Year Performance Warranty'
    ],
    image: 'https://solarvillage.africa/media/catalog/product/cache/74538e62df17dd01277a0fd8537c19ca/a/n/annotation_2024-11-14_112338.png',
    inStock: true,
    inventory: 40,
    purchasePrice: 97000,
    vendorPrice: 107000,
    expenses: 0
  }
];

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set.');
  }

  const sql = neon(databaseUrl);

  console.log('='.repeat(70));
  console.log(`ADD AFRICELL PRODUCTS TO CATALOG (${isDryRun ? 'DRY RUN' : 'LIVE INSERT'})`);
  console.log('='.repeat(70));

  const existing = await sql`SELECT id, title, price FROM "Product" ORDER BY id;`;
  console.log(`\nExisting products currently in database: ${existing.length}`);

  const existingTitles = new Set(existing.map(p => p.title.trim().toLowerCase()));

  const toInsert = africellProducts.filter(p => !existingTitles.has(p.title.trim().toLowerCase()));
  console.log(`Africell products to add: ${toInsert.length} (Skipping ${africellProducts.length - toInsert.length} duplicates)`);

  if (isDryRun) {
    console.log('\n[DRY RUN PREVIEW]:');
    toInsert.forEach((item, idx) => {
      console.log(`  ${idx + 1}. [${item.category}] ${item.title} - ₦${item.price.toLocaleString()}`);
      console.log(`     Image: ${item.image}`);
    });
    console.log('\nDry run complete. Run without --dry-run to insert.');
    return;
  }

  console.log('\n[INSERTING PRODUCTS]...');
  for (let i = 0; i < toInsert.length; i++) {
    const item = toInsert[i];
    const inserted = await sql`
      INSERT INTO "Product" (
        "title", "brand", "spec", "price", "image", "category", "warranty",
        "installationTime", "capacity", "compatibleWith", "features", "inStock",
        "inventory", "systemType", "purchasePrice", "vendorPrice", "expenses",
        "createdAt", "updatedAt"
      ) VALUES (
        ${item.title},
        ${item.brand},
        ${item.spec},
        ${item.price},
        ${item.image},
        ${item.category},
        ${item.warranty},
        ${item.installationTime},
        ${item.capacity},
        ${JSON.stringify(item.compatibleWith)},
        ${JSON.stringify(item.features)},
        ${item.inStock},
        ${item.inventory},
        ${item.systemType},
        ${item.purchasePrice},
        ${item.vendorPrice},
        ${item.expenses},
        NOW(),
        NOW()
      )
      RETURNING id, title, price;
    `;
    console.log(`  [${i + 1}/${toInsert.length}] Inserted ID: ${inserted[0].id} - ${inserted[0].title} (₦${Number(inserted[0].price).toLocaleString()})`);
  }

  const all = await sql`SELECT id, title, brand, category, price, "inStock", inventory FROM "Product" ORDER BY id;`;
  console.log('\n' + '='.repeat(70));
  console.log(`CATALOG UPDATE COMPLETE: Total ${all.length} products active in the database.`);
  console.log('='.repeat(70));
  console.table(all.map(p => ({
    id: p.id,
    title: p.title.length > 38 ? p.title.substring(0, 35) + '...' : p.title,
    brand: p.brand,
    category: p.category,
    price: '₦' + Number(p.price).toLocaleString(),
    inStock: p.inStock,
    stock: p.inventory
  })));
}

run().catch(err => {
  console.error('[ERROR]:', err);
  process.exit(1);
});
