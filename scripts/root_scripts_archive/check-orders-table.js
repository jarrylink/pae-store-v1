const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkOrders() {
  try {
    console.log('🔍 CHECKING ORDERS IN DATABASE');
    console.log('==============================');
    
    // Get all orders with basic info
    const orders = await sql`
      SELECT 
        id, 
        "userId",
        "orderNumber",
        "customerName",
        status,
        total,
        "createdAt"
      FROM "Order" 
      ORDER BY "createdAt" DESC
      LIMIT 10
    `;
    
    console.log(`\n📦 Found ${orders.length} orders:`);
    console.table(orders);

    // Check if any orders have NULL userId
    const nullUserOrders = await sql`
      SELECT COUNT(*) as count 
      FROM "Order" 
      WHERE "userId" IS NULL
    `;
    console.log(`\n❌ Orders with NULL userId: ${nullUserOrders[0].count}`);

    // Get unique userIds that have orders
    const users = await sql`
      SELECT DISTINCT "userId" 
      FROM "Order" 
      WHERE "userId" IS NOT NULL
    `;
    console.log(`\n👤 Unique userIds with orders: ${users.length}`);
    if (users.length > 0) {
      console.log('User IDs:', users.map(u => u.userId).join(', '));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkOrders();
