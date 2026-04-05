const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkOrders() {
  try {
    console.log('🔍 CHECKING ORDERS IN DATABASE');
    console.log('==============================');
    
    // Get total count
    const count = await sql`SELECT COUNT(*) as total FROM "Order"`;
    console.log(`\n📊 Total orders in database: ${count[0].total}`);

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
    
    if (orders.length === 0) {
      console.log('\n❌ No orders found in database');
    } else {
      console.log(`\n📦 Last ${orders.length} orders:`);
      orders.forEach((order, i) => {
        console.log(`\n--- Order ${i+1} ---`);
        console.log(`ID: ${order.id}`);
        console.log(`User ID: ${order.userId || 'NULL'}`);
        console.log(`Order Number: ${order.orderNumber}`);
        console.log(`Customer: ${order.customerName}`);
        console.log(`Status: ${order.status}`);
        console.log(`Total: ₦${order.total}`);
        console.log(`Date: ${order.createdAt}`);
      });
    }

    // Check for NULL userIds
    const nullUsers = await sql`
      SELECT COUNT(*) as count 
      FROM "Order" 
      WHERE "userId" IS NULL
    `;
    console.log(`\n❌ Orders with NULL userId: ${nullUsers[0].count}`);

    // Get unique userIds
    const users = await sql`
      SELECT DISTINCT "userId" 
      FROM "Order" 
      WHERE "userId" IS NOT NULL
    `;
    console.log(`\n👤 Unique userIds with orders: ${users.length}`);
    if (users.length > 0) {
      users.forEach((u, i) => console.log(`  ${i+1}. ${u.userId}`));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOrders();
