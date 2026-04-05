import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const sql = neon(process.env.DATABASE_URL);

async function checkOrders() {
  try {
    console.log('🔍 CHECKING ORDERS IN DATABASE');
    console.log('==============================');
    
    // Count total orders
    const count = await sql`SELECT COUNT(*) FROM "Order"`;
    console.log(`\n📊 Total orders in database: ${count[0].count}`);

    // Get all orders
    const orders = await sql`
      SELECT id, "orderNumber", "customerName", total, status, "createdAt", "userId"
      FROM "Order" 
      ORDER BY "createdAt" DESC
      LIMIT 10
    `;
    
    console.log('\n📦 Recent orders:');
    if (orders.length === 0) {
      console.log('No orders found');
    } else {
      console.table(orders);
    }

    // Get unique user IDs that have orders
    const users = await sql`
      SELECT DISTINCT "userId" FROM "Order"
    `;
    console.log('\n👤 Users with orders:', users.map(u => u.userId).join(', '));

  } catch (error) {
    console.error('❌ Error checking orders:', error);
  }
}

checkOrders();
