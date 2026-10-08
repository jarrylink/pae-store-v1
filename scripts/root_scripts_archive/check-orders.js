const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkOrders() {
    const orders = await sql`
        SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
        FROM "Order"
        WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
    `;
    console.log(`Orders found: ${orders[0].count}`);
    console.log(`Revenue: ₦${Number(orders[0].revenue).toLocaleString()}`);
}

checkOrders();
