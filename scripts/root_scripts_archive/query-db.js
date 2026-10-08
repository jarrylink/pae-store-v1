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
    
    // 2. Products table - schema and data
    console.log('\n📦 PRODUCTS TABLE:');
    const productColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `;
    console.log('   Columns:');
    productColumns.forEach(c => console.log(`     - ${c.column_name} (${c.data_type})`));
    
    const products = await sql`SELECT id, title, inventory, "inStock", price FROM products LIMIT 5`;
    console.log('\n   Sample products:');
    products.forEach(p => console.log(`     ID:${p.id} | ${p.title} | Stock:${p.inventory} | InStock:${p.inStock} | ₦${p.price}`));
    
    // 3. Orders table - schema and data
    console.log('\n📋 ORDERS TABLE:');
    const orderColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders'
      ORDER BY ordinal_position
    `;
    console.log('   Columns:');
    orderColumns.forEach(c => console.log(`     - ${c.column_name} (${c.data_type})`));
    
    const orders = await sql`SELECT id, "orderNumber", status, total, "createdAt" FROM orders ORDER BY "createdAt" DESC LIMIT 5`;
    console.log('\n   Recent orders:');
    orders.forEach(o => console.log(`     ID:${o.id} | ${o.orderNumber} | Status:${o.status} | ₦${o.total}`));
    
    // 4. Order items table
    console.log('\n🛒 ORDER_ITEMS TABLE:');
    const orderItems = await sql`SELECT * FROM order_items LIMIT 5`;
    if (orderItems.length > 0) {
      console.log('   Sample order items:');
      orderItems.forEach(item => console.log(`     Order:${item.orderId} | Product:${item.productId} | Qty:${item.quantity}`));
    } else {
      console.log('   No order items found');
    }
    
    // 5. Users table
    console.log('\n👤 USERS TABLE:');
    const userCount = await sql`SELECT COUNT(*) FROM users`;
    console.log(`   Total users: ${userCount[0].count}`);
    
    // 6. Check for inventory transaction table
    const hasInventoryLog = tables.some(t => t.table_name === 'inventory_transactions');
    console.log(`\n📊 Inventory tracking table exists: ${hasInventoryLog ? 'YES' : 'NO'}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

queryDatabase();
