/**
 * replace-product-catalog.cjs
 * 
 * Replaces existing records in the "Product" table with the new solar equipment catalog.
 * 
 * Features:
 * 1. Safe Archiving: Exports existing products to JSON backup file + "Product_Archive" DB table.
 * 2. Wipe: Clears "Product" table and resets the autoincrement primary key sequence.
 * 3. Verified Insert: Inserts all 13 new equipment items with high-resolution reference images,
 *    appropriate categories, specifications, warranties, compatibility, and Naira pricing.
 * 4. Verification: Fetches and displays the newly inserted catalog with verification checks.
 * 
 * Usage:
 *   node --env-file=.env scripts/replace-product-catalog.cjs --dry-run
 *   node --env-file=.env scripts/replace-product-catalog.cjs --execute
 */

const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

const newProducts = [
  {
    model: '5 WALL',
    title: 'Firman 5.12kWh 25.6V Wall Mount Lithium Battery (5 WALL)',
    brand: 'Firman',
    spec: '5.12 KWH 25.6V Lithium Battery, 90% DOD, 6-Year Warranty',
    price: 1040000,
    category: 'Lithium Battery',
    warranty: '6-Year Warranty',
    installationTime: '2-3 Hours',
    capacity: '5.12kWh',
    systemType: 'Energy Storage',
    compatibleWith: ['24V Inverter Systems', 'Solar Energy Systems', 'Hybrid Systems'],
    features: [
      '5.12kWh / 25.6V LiFePO4 Chemistry',
      '90% Depth of Discharge (DOD)',
      '6-Year Manufacturer Warranty',
      'Space-saving wall-mount form factor',
      'Built-in Intelligent Battery Management System (BMS)',
      'Up to 6,000+ charge cycles'
    ],
    image: 'https://cdn.shopify.com/s/files/1/0557/8696/3099/files/05wall.1890_697860e1-641b-41cf-aad6-d4479422d57e.png?v=1724334711',
    inStock: true,
    inventory: 15,
    purchasePrice: 850000,
    vendorPrice: 920000,
    expenses: 0
  },
  {
    model: '5 WALL',
    title: 'Firman 5.12kWh 51.2V Wall Mount Lithium Battery (5 WALL)',
    brand: 'Firman',
    spec: '5.12 KWH 51.2V Lithium Battery, 90% DOD, 6-Year Warranty',
    price: 1040000,
    category: 'Lithium Battery',
    warranty: '6-Year Warranty',
    installationTime: '2-3 Hours',
    capacity: '5.12kWh',
    systemType: 'Energy Storage',
    compatibleWith: ['48V Hybrid Inverters', 'Solar Energy Systems', 'Off-grid Systems'],
    features: [
      '5.12kWh / 51.2V (48V nominal) LiFePO4 Chemistry',
      '90% Depth of Discharge (DOD)',
      '6-Year Manufacturer Warranty',
      'High-grade prismatic cells',
      'Intelligent thermal & current BMS protection',
      'Up to 6,000+ charge cycles'
    ],
    image: 'https://cdn.shopify.com/s/files/1/0557/8696/3099/files/05wall.1890_697860e1-641b-41cf-aad6-d4479422d57e.png?v=1724334711',
    inStock: true,
    inventory: 15,
    purchasePrice: 850000,
    vendorPrice: 920000,
    expenses: 0
  },
  {
    model: '10 WALL',
    title: 'Firman 10.24kWh 51.2V Wall Mount Lithium Battery (10 WALL)',
    brand: 'Firman',
    spec: '10.24KWH 51.2V Lithium Battery, 90% DOD, 6-Year Warranty',
    price: 1788800,
    category: 'Lithium Battery',
    warranty: '6-Year Warranty',
    installationTime: '3-4 Hours',
    capacity: '10.24kWh',
    systemType: 'Energy Storage',
    compatibleWith: ['48V Hybrid Inverters', 'Commercial & Residential Solar', 'Parallel Units'],
    features: [
      '10.24kWh / 51.2V 200A LiFePO4 Energy Pack',
      '90% Depth of Discharge (DOD)',
      '6-Year Manufacturer Warranty',
      'Robust wall-mount casing with LCD status screen',
      'Multi-unit parallel scalability',
      'Deep-cycle life >6,000 cycles'
    ],
    image: 'https://cdn.shopify.com/s/files/1/0557/8696/3099/files/Untitled_design.png?v=1725350897',
    inStock: true,
    inventory: 10,
    purchasePrice: 1450000,
    vendorPrice: 1580000,
    expenses: 0
  },
  {
    model: '15 WALL',
    title: 'Firman 14.34kWh 51.2V Wall Mount Lithium Battery (15 WALL)',
    brand: 'Firman',
    spec: '14.34KWH 51.2V Lithium Battery, 90% DOD, 6-Year Warranty',
    price: 2308800,
    category: 'Lithium Battery',
    warranty: '6-Year Warranty',
    installationTime: '3-5 Hours',
    capacity: '14.34kWh',
    systemType: 'Energy Storage',
    compatibleWith: ['48V Hybrid Inverters', 'Heavy-Duty Residential & Commercial Solar'],
    features: [
      '14.34kWh High-Density LiFePO4 Storage',
      '90% Depth of Discharge (DOD)',
      '6-Year Manufacturer Warranty',
      'Heavy-duty industrial wall-mounting frame',
      'Advanced BMS with RS485/CAN communication',
      'Long-life cycle design'
    ],
    image: 'https://cdn.shopify.com/s/files/1/0557/8696/3099/files/Untitleddesign_41.png?v=1743243979',
    inStock: true,
    inventory: 8,
    purchasePrice: 1900000,
    vendorPrice: 2050000,
    expenses: 0
  },
  {
    model: 'FHO1K0120',
    title: 'Firman 1KW / 1.25kVA 12V Transformer-Based Hybrid Inverter (FHO1K0120)',
    brand: 'Firman',
    spec: 'Transformer based Hybrid inverter 1KW/1.25KVA 12V 2-Year Warranty',
    price: 134375,
    category: 'Hybrid Inverter',
    warranty: '2-Year Warranty',
    installationTime: '2-3 Hours',
    capacity: '1KW / 1.25kVA',
    systemType: 'Hybrid',
    compatibleWith: ['12V Battery Systems', 'Solar Panels', 'Mains Grid / Generator'],
    features: [
      'Copper transformer-based architecture for high surge tolerance',
      'Pure sine wave AC output',
      'Smart battery charging algorithm',
      'Compact wall or shelf mountable design',
      'Comprehensive overload and short-circuit protection'
    ],
    image: 'https://cdn.shopify.com/s/files/1/0557/8696/3099/files/Untitleddesign_11_b05a0d2a-afc1-4bd9-98be-3a7096b6dd0f.png?v=1685025160',
    inStock: true,
    inventory: 20,
    purchasePrice: 105000,
    vendorPrice: 118000,
    expenses: 0
  },
  {
    model: 'FHO3K0120',
    title: 'Firman 3KW / 3.75kVA 24V Transformer-Based Hybrid Inverter (FHO3K0120)',
    brand: 'Firman',
    spec: 'Transformer based Hybrid inverter 3KW/3.75KVA 24V 2-Year Warranty',
    price: 333250,
    category: 'Hybrid Inverter',
    warranty: '2-Year Warranty',
    installationTime: '3-4 Hours',
    capacity: '3KW / 3.75kVA',
    systemType: 'Hybrid',
    compatibleWith: ['24V Battery Systems', 'Solar Panels', 'Mains Grid / Generator'],
    features: [
      'Heavy-duty copper transformer for motor & inductive loads',
      'Pure sine wave AC output',
      'Integrated solar charge controller',
      'Multi-function LCD and LED status display',
      'Automatic transfer switch (mains to battery in ms)'
    ],
    image: 'https://cdn.shopify.com/s/files/1/0557/8696/3099/files/Untitleddesign_11_984daa8c-8f3f-4b21-80eb-356967c7a8e6.png?v=1685025415',
    inStock: true,
    inventory: 15,
    purchasePrice: 265000,
    vendorPrice: 295000,
    expenses: 0
  },
  {
    model: 'FH3K0110',
    title: 'Firman 3.5KW 24V Hybrid Solar Inverter with 120A MPPT (FH3K0110)',
    brand: 'Firman',
    spec: 'Transformer based Hybrid inverter 3.5KW 24V PV6500W 120A MPPT 2-Year Warranty',
    price: 322500,
    category: 'Hybrid Inverter',
    warranty: '2-Year Warranty',
    installationTime: '3-4 Hours',
    capacity: '3.5KW',
    systemType: 'Hybrid',
    compatibleWith: ['24V Battery Systems', 'Solar Panels up to 6500W', 'Lithium & Lead-Acid'],
    features: [
      'High-efficiency 120A MPPT Solar Charge Controller',
      'Massive 6500W Maximum PV input power',
      'Pure sine wave 3500W continuous output',
      'Configurable AC/Solar input priority via LCD',
      'Compatible with mains utility or generator power'
    ],
    image: 'https://cdn.shopify.com/s/files/1/0557/8696/3099/files/Untitleddesign_8_a12e2337-c034-4d62-836d-d4863010bb0b.png?v=1685020425',
    inStock: true,
    inventory: 12,
    purchasePrice: 255000,
    vendorPrice: 285000,
    expenses: 0
  },
  {
    model: 'FH6K0110',
    title: 'Firman 6KW 48V Parallel Hybrid Solar Inverter with 120A MPPT (FH6K0110)',
    brand: 'Firman',
    spec: 'Transformerless Hybrid inverter 6KW 48V PV8500W 120A MPPT 2-Year Warranty Support Parallel',
    price: 473000,
    category: 'Hybrid Inverter',
    warranty: '2-Year Warranty',
    installationTime: '3-5 Hours',
    capacity: '6KW',
    systemType: 'Hybrid',
    compatibleWith: ['48V Battery Systems', 'Solar Panels up to 8500W', 'Parallel Configuration'],
    features: [
      'Parallel operation capability for scalable multi-inverter setups',
      'Integrated 120A MPPT Solar Charge Controller',
      'High PV input capacity up to 8500W',
      'Transformerless design for ultra-high conversion efficiency (>97%)',
      'Smart BMS communication port (RS485/CAN)'
    ],
    image: 'https://cdn.shopify.com/s/files/1/0557/8696/3099/files/Untitleddesign_8_3ca537ae-01b2-465a-851f-4b7c4dfd74c3.png?v=1685024037',
    inStock: true,
    inventory: 10,
    purchasePrice: 380000,
    vendorPrice: 420000,
    expenses: 0
  },
  {
    model: 'FH6K0115',
    title: 'Firman 6KW 48V Non-Parallel Hybrid Solar Inverter with 120A MPPT (FH6K0115)',
    brand: 'Firman',
    spec: 'Transformerless Hybrid inverter 6KW 48V PV8500W 120A MPPT 2-Year Warranty Non-Parallel',
    price: 441075,
    category: 'Hybrid Inverter',
    warranty: '2-Year Warranty',
    installationTime: '3-5 Hours',
    capacity: '6KW',
    systemType: 'Hybrid',
    compatibleWith: ['48V Battery Systems', 'Solar Panels up to 8500W', 'Single-Unit Installations'],
    features: [
      'Cost-optimized standalone 6KW hybrid inverter',
      'Built-in 120A MPPT Controller with 8500W PV input',
      'High-speed seamless auto-transfer during outages',
      'Transformerless topology for whisper-quiet operation',
      'Overload, overheating, and short-circuit protection'
    ],
    image: 'https://cdn.shopify.com/s/files/1/0557/8696/3099/files/Untitleddesign_8_3ca537ae-01b2-465a-851f-4b7c4dfd74c3.png?v=1685024037',
    inStock: true,
    inventory: 10,
    purchasePrice: 350000,
    vendorPrice: 390000,
    expenses: 0
  },
  {
    model: 'FH11K0110',
    title: 'Firman 11KW 48V Parallel Hybrid Solar Inverter with 150A MPPT (FH11K0110)',
    brand: 'Firman',
    spec: 'Transformerless Hybrid inverter 11KW 48V 150A MPPT 2-Year Warranty Support Parallel',
    price: 1075000,
    category: 'Hybrid Inverter',
    warranty: '2-Year Warranty',
    installationTime: '4-6 Hours',
    capacity: '11KW',
    systemType: 'Hybrid',
    compatibleWith: ['48V Battery Systems', 'Heavy Commercial / Large Residential Solar', 'Parallel Systems'],
    features: [
      'Heavy-duty 11KW (11,000W) continuous AC output',
      'Dual 150A high-capacity MPPT solar charger',
      'Parallel capability up to multiple units for 3-phase or high kW power',
      'Transformerless high-frequency design with >98% peak efficiency',
      'Advanced monitoring with Wi-Fi / GPRS mobile tracking'
    ],
    image: 'https://cdn.shopify.com/s/files/1/0557/8696/3099/files/Untitleddesign_40_fac9e497-bd22-463c-8fec-1be9c7481aa4.png?v=1743238347',
    inStock: true,
    inventory: 6,
    purchasePrice: 860000,
    vendorPrice: 950000,
    expenses: 0
  },
  {
    model: 'FH11K0115',
    title: 'Firman 11KW 48V Non-Parallel Hybrid Solar Inverter with 150A MPPT (FH11K0115)',
    brand: 'Firman',
    spec: 'Transformerless Hybrid inverter 11KW 48V 150A MPPT 2-Year Warranty Non-Parallel',
    price: 1042025,
    category: 'Hybrid Inverter',
    warranty: '2-Year Warranty',
    installationTime: '4-6 Hours',
    capacity: '11KW',
    systemType: 'Hybrid',
    compatibleWith: ['48V Battery Systems', 'Heavy Commercial / Large Residential Solar', 'Standalone Systems'],
    features: [
      'Standalone 11KW (11,000W) pure sine wave hybrid inverter',
      'High-power 150A MPPT solar charging system',
      'Transformerless high-frequency design for maximum energy harvest',
      'Smart load shedding and generator automatic startup control',
      'Full protection suite against voltage surges and reverse polarity'
    ],
    image: 'https://cdn.shopify.com/s/files/1/0557/8696/3099/files/Untitleddesign_40_fac9e497-bd22-463c-8fec-1be9c7481aa4.png?v=1743238347',
    inStock: true,
    inventory: 6,
    purchasePrice: 830000,
    vendorPrice: 920000,
    expenses: 0
  },
  {
    model: '410M',
    title: 'LONGI 410W Monocrystalline Half-Cut MBB Solar Panel (410M)',
    brand: 'LONGI',
    spec: '410W mono, half-cut MBB solar panel',
    price: 98000,
    category: 'Solar Panel',
    warranty: '12-Year Warranty',
    installationTime: '1-2 Hours',
    capacity: '410W',
    systemType: 'Solar PV',
    compatibleWith: ['Residential Rooftops', 'Commercial Solar Systems', 'All Inverter & Controller Brands'],
    features: [
      'High-efficiency monocrystalline PERC half-cut cells',
      'Multi-Busbar (MBB) design for improved photon capture',
      'Low degradation rate with guaranteed 25-year linear power warranty',
      'Anodized aluminum alloy frame resistant to heavy wind and snow loads',
      'High low-light performance on overcast mornings and late afternoons'
    ],
    image: 'https://cdn.shopify.com/s/files/1/0557/8696/3099/files/Untitleddesign_61.png?v=1775313979',
    inStock: true,
    inventory: 50,
    purchasePrice: 78000,
    vendorPrice: 87000,
    expenses: 0
  },
  {
    model: '600M',
    title: 'LONGI 600W Monocrystalline Half-Cut MBB Bifacial Solar Panel (600M)',
    brand: 'LONGI',
    spec: '600W mono, half-cut MBB Bifacial solar panel',
    price: 127000,
    category: 'Solar Panel',
    warranty: '12-Year Warranty',
    installationTime: '1-2 Hours',
    capacity: '600W',
    systemType: 'Solar PV',
    compatibleWith: ['Commercial Flat Roofs', 'Ground-Mount Solar Farms', 'High-Yield Residential Systems'],
    features: [
      'Bifacial power generation with up to 25% additional energy yield from rear side',
      'High-power 600W output with half-cut MBB technology',
      'Dual-glass design for maximum PID resistance and environmental durability',
      'Lower levelized cost of energy (LCOE)',
      '12-Year product warranty & 30-Year power output warranty'
    ],
    image: 'https://cdn.shopify.com/s/files/1/0557/8696/3099/files/Untitleddesign_56.png?v=1763369604',
    inStock: true,
    inventory: 40,
    purchasePrice: 102000,
    vendorPrice: 114000,
    expenses: 0
  }
];

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in the environment.');
  }

  const sql = neon(databaseUrl);

  console.log('='.repeat(70));
  console.log(`PRODUCT CATALOG REPLACEMENT SCRIPT (${isDryRun ? 'DRY RUN MODE' : 'LIVE EXECUTION MODE'})`);
  console.log('='.repeat(70));

  // Step 1: Query existing products
  const existingProducts = await sql`SELECT * FROM "Product" ORDER BY id;`;
  console.log(`\n[STEP 1] Found ${existingProducts.length} existing products in the "Product" table.`);

  if (isDryRun) {
    console.log('\n[DRY RUN] Existing products that would be archived & cleared:');
    existingProducts.forEach(p => {
      console.log(`  - [ID: ${p.id}] ${p.title} (${p.category}) - ₦${Number(p.price).toLocaleString()}`);
    });

    console.log(`\n[DRY RUN] ${newProducts.length} new items planned for insertion:`);
    newProducts.forEach((p, idx) => {
      console.log(`  ${idx + 1}. [${p.category}] ${p.title}`);
      console.log(`     Model: ${p.model} | Price: ₦${p.price.toLocaleString()} | Warranty: ${p.warranty}`);
      console.log(`     Image: ${p.image}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('DRY RUN COMPLETE. No changes were made to the database.');
    console.log('To execute this operation live, run with the --execute flag.');
    console.log('='.repeat(70));
    return;
  }

  // Live Execution
  console.log('\n[STEP 2] Archiving existing products...');
  // 1. JSON file backup
  const backupDir = path.join(__dirname, 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(backupDir, `products-backup-${timestamp}.json`);
  fs.writeFileSync(backupFilePath, JSON.stringify(existingProducts, null, 2), 'utf-8');
  console.log(`  -> JSON archive saved to: ${backupFilePath}`);

  // 2. Database archive table
  await sql`
    CREATE TABLE IF NOT EXISTS "Product_Archive" (
      "archivedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      "id" INTEGER,
      "title" TEXT,
      "brand" TEXT,
      "spec" TEXT,
      "price" INTEGER,
      "image" TEXT,
      "category" TEXT,
      "warranty" TEXT,
      "installationTime" TEXT,
      "capacity" TEXT,
      "compatibleWith" JSONB,
      "features" JSONB,
      "inStock" BOOLEAN,
      "inventory" INTEGER,
      "systemType" TEXT,
      "createdAt" TIMESTAMP WITHOUT TIME ZONE,
      "updatedAt" TIMESTAMP WITHOUT TIME ZONE,
      "purchasePrice" INTEGER,
      "vendorPrice" INTEGER,
      "expenses" NUMERIC
    );
  `;

  if (existingProducts.length > 0) {
    for (const p of existingProducts) {
      await sql`
        INSERT INTO "Product_Archive" (
          "archivedAt", "id", "title", "brand", "spec", "price", "image", 
          "category", "warranty", "installationTime", "capacity", "compatibleWith", 
          "features", "inStock", "inventory", "systemType", "createdAt", 
          "updatedAt", "purchasePrice", "vendorPrice", "expenses"
        ) VALUES (
          NOW(), ${p.id}, ${p.title}, ${p.brand}, ${p.spec}, ${p.price}, ${p.image},
          ${p.category}, ${p.warranty}, ${p.installationTime}, ${p.capacity}, ${JSON.stringify(p.compatibleWith)},
          ${JSON.stringify(p.features)}, ${p.inStock}, ${p.inventory}, ${p.systemType}, ${p.createdAt},
          ${p.updatedAt}, ${p.purchasePrice}, ${p.vendorPrice}, ${p.expenses}
        );
      `;
    }
    console.log(`  -> Archived ${existingProducts.length} rows to "Product_Archive" table.`);
  }

  // Step 3: Clear Product table and reset sequence
  console.log('\n[STEP 3] Clearing existing records from "Product" table...');
  await sql`DELETE FROM "Product";`;
  await sql`ALTER SEQUENCE "Product_id_seq" RESTART WITH 1;`;
  console.log('  -> "Product" table wiped and ID sequence reset to 1.');

  // Step 4: Insert new products
  console.log('\n[STEP 4] Inserting 13 new solar equipment products...');
  for (let i = 0; i < newProducts.length; i++) {
    const item = newProducts[i];
    await sql`
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
      );
    `;
    console.log(`  [${i + 1}/${newProducts.length}] Inserted: ${item.title} (₦${item.price.toLocaleString()})`);
  }

  // Step 5: Verification query
  console.log('\n[STEP 5] Verifying newly inserted catalog...');
  const inserted = await sql`SELECT id, title, category, price, "inStock", inventory FROM "Product" ORDER BY id;`;
  console.table(inserted);

  console.log('\n' + '='.repeat(70));
  console.log(`CATALOG REPLACEMENT SUCCESSFUL: ${inserted.length} items active in the database.`);
  console.log('='.repeat(70));
}

run().catch((err) => {
  console.error('\n[FATAL ERROR]:', err);
  process.exit(1);
});
