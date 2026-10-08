const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkDateRange() {
    console.log('\n📅 CHECKING ORDERS BY DATE RANGE:\n');
    console.log('='.repeat(60));
    
    const orders = await sql`
        SELECT 
            id,
            "orderNumber",
            status,
            total,
            "createdAt"
        FROM "Order"
        ORDER BY "createdAt" DESC
    `;
    
    console.log('\nAll orders with dates:\n');
    orders.forEach(order => {
        const date = new Date(order.createdAt);
        const isRecent = (Date.now() - date.getTime()) / (1000 * 3600 * 24) <= 30;
        console.log(`  ${order.orderNumber}: ${order.status} - ₦${order.total} - ${date.toLocaleDateString()} ${isRecent ? '(Within 30 days)' : '(Outside 30 days)'}`);
    });
    
    // Count orders by status within last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await sql`
        SELECT 
            status,
            COUNT(*) as count,
            SUM(total) as total
        FROM "Order"
        WHERE "createdAt" >= ${thirtyDaysAgo.toISOString()}
        GROUP BY status
    `;
    
    console.log('\n📊 Orders in last 30 days:\n');
    if (recentOrders.length === 0) {
        console.log('  No orders found in the last 30 days!');
    } else {
        recentOrders.forEach(r => {
            console.log(`  ${r.status}: ${r.count} orders, ₦${Number(r.total).toLocaleString()}`);
        });
    }
}

checkDateRange();
