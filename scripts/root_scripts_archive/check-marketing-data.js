const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkData() {
    console.log('\n📊 AVAILABLE DATA FOR MARKETING & ESG:\n');
    
    // Check orders for revenue and growth
    const orders = await sql`
        SELECT 
            DATE_TRUNC('month', "createdAt") as month,
            COUNT(*) as orders,
            SUM(total) as revenue
        FROM "Order"
        WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
        LIMIT 6
    `;
    
    console.log('📈 Monthly Revenue:');
    orders.forEach(o => {
        console.log(`  ${o.month.toISOString().slice(0,7)}: ${o.orders} orders, ₦${Number(o.revenue).toLocaleString()}`);
    });
    
    // Check customers for growth
    const customers = await sql`
        SELECT COUNT(DISTINCT "userId") as unique_customers
        FROM "Order"
        WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
    `;
    console.log(`\n👥 Unique Customers: ${customers[0].unique_customers}`);
    
    // Check products for categories (ESG - renewable energy)
    const products = await sql`
        SELECT category, COUNT(*) as count
        FROM "Product"
        WHERE category IS NOT NULL
        GROUP BY category
    `;
    console.log('\n🌱 Product Categories (ESG related):');
    products.forEach(p => {
        console.log(`  ${p.category}: ${p.count} products`);
    });
    
    // Check vendors for growth
    const vendors = await sql`
        SELECT COUNT(*) as vendor_count
        FROM "Vendor"
        WHERE status = 'active'
    `;
    console.log(`\n🏢 Active Vendors: ${vendors[0].vendor_count}`);
}

checkData();
