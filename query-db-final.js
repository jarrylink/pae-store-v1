const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function queryDatabase() {
  console.log('🔍 Querying Neon Database...\n');
  
  try {
    // 1. Product data
    console.log('📦 PRODUCT DATA (first 5):');
    const products = await sql`SELECT id, title, inventory, "inStock", price, category FROM "Product" LIMIT 5`;
    if (products.length > 0) {
      products.forEach(p => console.log(`     ${p.id} | ${p.title?.substring(0,40)} | Stock:${p.inventory || 0} | InStock:${p.inStock} | ₦${p.price}`));
    } else {
      console.log('     No products found');
    }
    
    // 2. Check inventory field values
    console.log('\n📊 INVENTORY SUMMARY:');
    const inventoryStats = await sql`SELECT COUNT(*) as total, SUM(inventory) as totalStock, COUNT(CASE WHEN inventory <= 5 THEN 1 END) as lowStock FROM "Product"`;
    console.log(`     Total Products: ${inventoryStats[0].total}`);
    console.log(`     Total Stock Units: ${inventoryStats[0].totalStock || 0}`);
    console.log(`     Low Stock Products (≤5): ${inventoryStats[0].lowStock || 0}`);
    
    // 3. Order table schema - check for delivery fields
    console.log('\n📋 ORDER TABLE SCHEMA (key fields):');
    const orderColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'Order'
      AND column_name IN ('status', 'paymentStatus', 'actualDelivery', 'estimatedDelivery', 'createdAt', 'total')
      ORDER BY column_name
    `;
    orderColumns.forEach(c => console.log(`     - ${c.column_name} (${c.data_type})`));
    
    // 4. Recent orders
    console.log('\n📋 RECENT ORDERS (last 5):');
    const orders = await sql`SELECT id, "orderNumber", status, total, "createdAt", "paymentStatus", "actualDelivery" FROM "Order" ORDER BY "createdAt" DESC LIMIT 5`;
    if (orders.length > 0) {
      orders.forEach(o => console.log(`     ${o.id} | ${o.orderNumber} | ${o.status} | ₦${o.total} | Delivery:${o.actualDelivery || 'pending'}`));
    } else {
      console.log('     No orders found');
    }
    
    // 5. Order status distribution
    console.log('\n📊 ORDER STATUS DISTRIBUTION:');
    const statusCount = await sql`SELECT status, COUNT(*) as count FROM "Order" GROUP BY status`;
    statusCount.forEach(s => console.log(`     ${s.status}: ${s.count}`));
    
    // 6. Category table
    console.log('\n📁 CATEGORIES:');
    const categories = await sql`SELECT id, name, slug FROM "Category" LIMIT 10`;
    categories.forEach(c => console.log(`     ${c.id} | ${c.name} (${c.slug})`));
    
    // 7. Users
    console.log('\n👤 USERS:');
    const userCount = await sql`SELECT COUNT(*) FROM "User"`;
    const userRoles = await sql`SELECT role, COUNT(*) FROM "User" GROUP BY role`;
    console.log(`     Total users: ${userCount[0].count}`);
    userRoles.forEach(r => console.log(`     ${r.role}: ${r.count}`));
    
    // 8. Summary of what's available for analytics
    console.log('\n✅ ANALYTICS CAPABILITY SUMMARY:');
    console.log('   📊 Fully supported (ready):');
    console.log('     - Total Revenue (from orders.total)');
    console.log('     - Total Orders (count)');
    console.log('     - Total Customers (from User table)');
    console.log('     - Average Order Value');
    console.log('     - Revenue Trend (by createdAt)');
    console.log('     - Order Status Distribution');
    console.log('     - Category Sales (from product.category)');
    console.log('     - Inventory tracking (inventory field exists)');
    console.log('     - Low Stock Alerts (inventory ≤ 5)');
    
    console.log('\n   ⚠️ Needs additional fields:');
    console.log('     - Actual delivery date (actualDelivery exists? ' + (orderColumns.some(c => c.column_name === 'actualDelivery') ? 'YES' : 'NO') + ')');
    console.log('     - Reserved stock (missing)');
    console.log('     - Inventory transaction log (missing)');
    
    console.log('\n✅ Query completed!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

queryDatabase();
