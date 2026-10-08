const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkAccessories() {
  console.log('\n?? ACCESSORY TABLE STRUCTURE\n');
  
  // Check if Accessory table exists
  const accessoryColumns = await sql`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'Accessory' 
    ORDER BY ordinal_position
  `;
  
  if (accessoryColumns.length === 0) {
    console.log('  ? Accessory table does not exist!');
    console.log('\n?? Creating Accessory table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS "Accessory" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(12,2) NOT NULL,
        category VARCHAR(100) DEFAULT 'accessories',
        image TEXT,
        sku VARCHAR(50),
        unit VARCHAR(50) DEFAULT 'piece',
        stock INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('  ? Accessory table created successfully!');
    
    // Insert sample data
    await sql`
      INSERT INTO "Accessory" (name, description, price, category, sku, unit, stock) VALUES
      ('Panel Rack, Bolt & Nut', 'Mounting rack with bolts and nuts for solar panel installation', 50000, 'mounting', 'ACC-001', 'set', 50),
      ('6mm² PV Cable', 'Solar PV cable for panel connections', 96000, 'cables', 'ACC-002', 'yards', 200),
      ('AC Surge Device', 'Surge protection device for AC side', 16000, 'protection', 'ACC-003', 'piece', 30),
      ('100A Change Over Switch', 'Change over switch for generator/solar', 8000, 'switches', 'ACC-004', 'piece', 25)
    ON CONFLICT (sku) DO NOTHING
    `;
    
    console.log('  ? Sample data inserted!');
  } else {
    accessoryColumns.forEach(col => {
      console.log('  -', col.column_name, ':', col.data_type, '(Nullable:', col.is_nullable + ')');
    });
  }
  
  // Get count
  const count = await sql`SELECT COUNT(*) as total FROM "Accessory"`;
  console.log(`\n?? Total Accessories: ${count[0].total}`);
  
  // Get all accessories
  const accessories = await sql`
    SELECT id, name, price, category, sku, unit, stock, "isActive" 
    FROM "Accessory" 
    ORDER BY id ASC
  `;
  
  console.log('\n?? Accessories List:');
  if (accessories.length > 0) {
    accessories.forEach(a => {
      const status = a.isActive ? '? Active' : '? Inactive';
      console.log(`  ${a.id}. ${a.name} - ?${a.price} (${a.unit}) Stock: ${a.stock} ${status}`);
    });
  } else {
    console.log('  No accessories found.');
  }
  
  process.exit();
}

checkAccessories().catch(err => { 
  console.error('? Error:', err.message); 
  process.exit(1); 
});