const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkDb() {
    // Check orders
    const orders = await sql`
        SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
        FROM "Order"
        WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
    `;
    console.log(`Orders: ${orders[0].count}, Revenue: ₦${Number(orders[0].revenue).toLocaleString()}`);
    
    // Check customers
    const customers = await sql`
        SELECT COUNT(DISTINCT "userId") as count
        FROM "Order"
        WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
    `;
    console.log(`Customers: ${customers[0].count}`);
    
    // Check vendors
    const vendors = await sql`
        SELECT COUNT(*) as count
        FROM "Vendor"
        WHERE status = 'active'
    `;
    console.log(`Active Vendors: ${vendors[0].count}`);
}

checkDb();
