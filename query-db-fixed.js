const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function queryDatabase() {
  console.log('🔍 Querying Neon Database...\n');
  
  try {
    // 1. List all tables
    console.log('📁 TABLES IN DATABASE:');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    tables.forEach(t => console.log(`   - ${t.table_name}`));
    
    // 2. Product table schema (capitalized)
    console.log('\n📦 PRODUCT TABLE SCHEMA:');
    const productColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Product'
      ORDER BY ordinal_position
    `;
    productColumns.forEach(c => console.log(`     - ${c.column_name} (${c.data_type})`));
    
    // 3. Product data
    console.log('\n📦 PRODUCT DATA (first 5):');
    const products = await sql`SELECT id, title, inventory, "inStock", price, "categoryId" FROM "Product" LIMIT 5`;
    if (products.length > 0) {
      products.forEach(p => console.log(`     ${p.id} | ${p.title?.substring(0,30)} | Stock:${p.inventory || 0} | InStock:${p.inStock} | ₦${p.price}`));
    } else {
      console.log('     No products found');
    }
    
    // 4. Order table schema
    console.log('\n📋 ORDER TABLE SCHEMA:');
    const orderColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'Order'
      ORDER BY ordinal_position
    `;
    orderColumns.forEach(c => console.log(`     - ${c.column_name} (${c.data_type})`));
    
    // 5. Recent orders
    console.log('\n📋 RECENT ORDERS:');
    const orders = await sql`SELECT id, "orderNumber", status, total, "createdAt", "paymentStatus" FROM "Order" ORDER BY "createdAt" DESC LIMIT 5`;
    if (orders.length > 0) {
      orders.forEach(o => console.log(`     ${o.id} | ${o.orderNumber} | ${o.status} | ₦${o.total} | Payment:${o.paymentStatus}`));
    } else {
      console.log('     No orders found');
    }
    
    // 6. Category table
    console.log('\n📁 CATEGORY TABLE:');
    const categories = await sql`SELECT id, name, slug FROM "Category" LIMIT 5`;
    if (categories.length > 0) {
      categories.forEach(c => console.log(`     ${c.id} | ${c.name} (${c.slug})`));
    }
    
    // 7. Users
    console.log('\n👤 USERS:');
    const userCount = await sql`SELECT COUNT(*) FROM "User"`;
    console.log(`     Total users: ${userCount[0].count}`);
    
    // 8. Check for inventory fields in Product
    console.log('\n📊 INVENTORY FIELDS IN PRODUCT:');
    const inventoryFields = productColumns.filter(c => 
      c.column_name === 'inventory' || 
      c.column_name === 'inStock' || 
      c.column_name === 'reservedStock' ||
      c.column_name === 'lowStockThreshold'
    );
    inventoryFields.forEach(f => console.log(`     ✅ ${f.column_name} (${f.data_type})`));
    
    if (inventoryFields.length === 0) {
      console.log('     ⚠️ No inventory fields found in Product table');
    }
    
    console.log('\n✅ Query completed!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

queryDatabase();
