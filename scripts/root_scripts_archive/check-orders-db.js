const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkOrders() {
    console.log('\n📦 ALL ORDERS IN DATABASE:\n');
    console.log('='.repeat(60));
    
    // Get all orders with their details - using correct case-sensitive column names
    const orders = await sql`
        SELECT 
            id,
            "orderNumber",
            status,
            total,
            "createdAt",
            "paymentMethod",
            "shippingAddress"->>'state' as state
        FROM "Order"
        ORDER BY "createdAt" DESC
    `;
    
    console.log(`\nTotal orders found: ${orders.length}\n`);
    
    if (orders.length === 0) {
        console.log('❌ NO ORDERS FOUND IN DATABASE!');
        return;
    }
    
    // Show each order
    orders.forEach(order => {
        console.log(`Order ${order.orderNumber || order.id}:`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Total: ₦${Number(order.total).toLocaleString()}`);
        console.log(`  Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        console.log(`  Payment: ${order.paymentMethod || 'N/A'}`);
        console.log(`  State: ${order.state || 'N/A'}`);
        console.log('---');
    });
    
    // Group by status
    const statusGroups = {};
    orders.forEach(order => {
        if (!statusGroups[order.status]) {
            statusGroups[order.status] = [];
        }
        statusGroups[order.status].push(order);
    });
    
    console.log('\n📊 SUMMARY BY STATUS:');
    Object.keys(statusGroups).forEach(status => {
        const statusOrders = statusGroups[status];
        const totalValue = statusOrders.reduce((sum, o) => sum + Number(o.total), 0);
        console.log(`  ${status}: ${statusOrders.length} orders, Total: ₦${totalValue.toLocaleString()}`);
    });
    
    // Check for confirmed orders (revenue)
    const revenueOrders = orders.filter(o => ['confirmed', 'processing', 'shipped', 'delivered'].includes(o.status));
    const totalRevenue = revenueOrders.reduce((sum, o) => sum + Number(o.total), 0);
    
    console.log(`\n💰 REVENUE ORDERS (confirmed+): ${revenueOrders.length} orders, Total: ₦${totalRevenue.toLocaleString()}`);
    
    // Check pending orders (pipeline)
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const pipelineValue = pendingOrders.reduce((sum, o) => sum + Number(o.total), 0);
    
    console.log(`⏳ PIPELINE (pending): ${pendingOrders.length} orders, Value: ₦${pipelineValue.toLocaleString()}`);
    
    // Calculate date range for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
    console.log(`\n📅 Last 30 days: ${recentOrders.length} orders, Value: ₦${recentOrders.reduce((sum, o) => sum + Number(o.total), 0).toLocaleString()}`);
}

checkOrders().catch(console.error);
