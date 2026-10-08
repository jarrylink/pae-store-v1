const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function debugRevenueAPI() {
    try {
        console.log('🔍 DEBUGGING REVENUE API:\n');
        
        // 1. Check if cost prices are being fetched
        const products = await sql`
            SELECT id, title, price, "purchasePrice" as cost 
            FROM "Product" 
            WHERE "purchasePrice" > 0 
            LIMIT 3
        `;
        console.log('📦 Products with costs:');
        products.forEach(p => {
            console.log(`  ID: ${p.id}, ${p.title}: Price=${p.price}, Cost=${p.cost}`);
        });
        
        // 2. Check if order items contain product IDs
        const orderItems = await sql`
            SELECT id, items, total 
            FROM "Order" 
            LIMIT 3
        `;
        console.log('\n📦 Order items structure:');
        orderItems.forEach(o => {
            console.log(`  Order ${o.id}:`, typeof o.items);
            if (typeof o.items === 'string') {
                const parsed = JSON.parse(o.items);
                console.log('    Items:', parsed);
            }
        });
        
        // 3. Check the revenue-sales API directly
        console.log('\n📊 Testing Revenue API...');
        const response = await fetch('http://localhost:3000/api/admin/analytics/revenue-sales?range=30d');
        const data = await response.json();
        
        console.log('API Response - Metrics:', JSON.stringify(data.metrics, null, 2));
        console.log('API Response - Revenue:', JSON.stringify(data.revenue, null, 2));
        console.log('API Response - Revenue Categories:', JSON.stringify(data.revenueCategories, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugRevenueAPI();
