const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkData() {
    try {
        console.log('📊 CHECKING ACTUAL DATABASE DATA:\n');
        
        // Check orders
        const orders = await sql`
            SELECT id, status, total, "paymentMethod", "createdAt" 
            FROM "Order" 
            ORDER BY "createdAt" DESC 
            LIMIT 10
        `;
        console.log('📦 Recent Orders:');
        orders.forEach(o => {
            console.log(`  Order #${o.id}: ${o.status} - ${o.total} (${o.paymentMethod})`);
        });
        
        // Check if there are any confirmed/delivered orders
        const revenueOrders = await sql`
            SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
            FROM "Order" 
            WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
        `;
        console.log(`\n💰 Revenue Orders: ${revenueOrders[0].count} orders, Total: ${revenueOrders[0].revenue}`);
        
        // Check pending orders
        const pendingOrders = await sql`
            SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
            FROM "Order" 
            WHERE status = 'pending'
        `;
        console.log(`⏳ Pending Orders: ${pendingOrders[0].count} orders, Total: ${pendingOrders[0].revenue}`);
        
        // Check products with cost prices
        const products = await sql`
            SELECT id, title, price, "purchasePrice" as costPrice 
            FROM "Product" 
            LIMIT 5
        `;
        console.log('\n📦 Products with cost prices:');
        products.forEach(p => {
            console.log(`  ${p.title}: Price=${p.price}, Cost=${p.costPrice || 'N/A'}`);
        });
        
        // Check services with cost prices
        const services = await sql`
            SELECT id, name, price, "costPrice" 
            FROM "Service" 
            LIMIT 5
        `;
        console.log('\n🔧 Services with cost prices:');
        services.forEach(s => {
            console.log(`  ${s.name}: Price=${s.price}, Cost=${s.costPrice || 'N/A'}`);
        });
        
        // Check accessories with cost prices
        const accessories = await sql`
            SELECT id, name, price, "costPrice" 
            FROM "Accessory" 
            LIMIT 5
        `;
        console.log('\n📎 Accessories with cost prices:');
        accessories.forEach(a => {
            console.log(`  ${a.name}: Price=${a.price}, Cost=${a.costPrice || 'N/A'}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkData();
