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
    
    // 2. Products table - check all columns
    console.log('\n📦 PRODUCTS TABLE SCHEMA:');
    const productColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `;
    productColumns.forEach(c => console.log(`     - ${c.column_name} (${c.data_type})`));
    
    // 3. Products data
    console.log('\n📦 PRODUCTS DATA (first 5):');
    const products = await sql`SELECT id, title, inventory, "inStock", price, category FROM products LIMIT 5`;
    if (products.length > 0) {
      products.forEach(p => console.log(`     ${p.id} | ${p.title.substring(0,30)} | Stock:${p.inventory || 0} | InStock:${p.inStock} | ₦${p.price}`));
    } else {
      console.log('     No products found');
    }
    
    // 4. Orders table schema
    console.log('\n📋 ORDERS TABLE SCHEMA:');
    const orderColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'orders'
      ORDER BY ordinal_position
    `;
    orderColumns.forEach(c => console.log(`     - ${c.column_name} (${c.data_type})`));
    
    // 5. Recent orders
    console.log('\n📋 RECENT ORDERS:');
    const orders = await sql`SELECT id, "orderNumber", status, total, "createdAt", "paymentStatus" FROM orders ORDER BY "createdAt" DESC LIMIT 5`;
    if (orders.length > 0) {
      orders.forEach(o => console.log(`     ${o.id} | ${o.orderNumber} | ${o.status} | ₦${o.total} | Payment:${o.paymentStatus}`));
    } else {
      console.log('     No orders found');
    }
    
    // 6. Order items
    console.log('\n🛒 ORDER_ITEMS:');
    const orderItems = await sql`SELECT oi.*, o."orderNumber" FROM order_items oi JOIN orders o ON oi."orderId" = o.id LIMIT 5`;
    if (orderItems.length > 0) {
      orderItems.forEach(item => console.log(`     Order:${item.orderNumber} | Product:${item.productId} | Qty:${item.quantity} | Price:₦${item.price}`));
    } else {
      console.log('     No order items found');
    }
    
    // 7. Users count
    console.log('\n👤 USERS:');
    const userCount = await sql`SELECT COUNT(*) FROM users`;
    console.log(`     Total users: ${userCount[0].count}`);
    
    // 8. Check for inventory-related tables
    const inventoryTables = tables.filter(t => t.table_name.includes('inventory') || t.table_name.includes('stock'));
    console.log('\n📊 INVENTORY TABLES:');
    if (inventoryTables.length > 0) {
      inventoryTables.forEach(t => console.log(`     - ${t.table_name}`));
    } else {
      console.log('     No dedicated inventory tracking tables found');
    }
    
    console.log('\n✅ Query completed!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

queryDatabase();
