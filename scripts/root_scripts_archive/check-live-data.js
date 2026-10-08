const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkData() {
  console.log('\n📊 DATABASE DATA SUMMARY\n');
  
  // Orders
  const orders = await sql`SELECT COUNT(*) as count, SUM(total) as revenue FROM "Order"`;
  console.log(`📦 ORDERS: ${orders[0].count} orders, Revenue: ₦${orders[0].revenue}`);
  
  // Orders by status
  const status = await sql`SELECT status, COUNT(*) FROM "Order" GROUP BY status`;
  console.log(`📊 ORDER STATUS:`, status);
  
  // Products
  const products = await sql`SELECT COUNT(*) as count FROM "Product"`;
  console.log(`📦 PRODUCTS: ${products[0].count}`);
  
  // Categories
  const categories = await sql`SELECT category, COUNT(*) FROM "Product" GROUP BY category`;
  console.log(`📁 CATEGORIES:`, categories);
  
  // Customers
  const customers = await sql`SELECT COUNT(*) FROM "User" WHERE role = 'customer'`;
  console.log(`👥 CUSTOMERS: ${customers[0].count}`);
  
  // Last 30 days orders
  const last30 = await sql`
    SELECT COUNT(*) as orders, SUM(total) as revenue
    FROM "Order"
    WHERE "createdAt" >= NOW() - INTERVAL '30 days'
  `;
  console.log(`\n📆 LAST 30 DAYS: ${last30[0].orders} orders, Revenue: ₦${last30[0].revenue}`);
  
  // Previous 30 days
  const prev30 = await sql`
    SELECT COUNT(*) as orders, SUM(total) as revenue
    FROM "Order"
    WHERE "createdAt" >= NOW() - INTERVAL '60 days'
      AND "createdAt" < NOW() - INTERVAL '30 days'
  `;
  console.log(`📆 PREVIOUS 30 DAYS: ${prev30[0].orders} orders, Revenue: ₦${prev30[0].revenue}`);
}

checkData();
