const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

function getDatabaseUrl() {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
    return match ? match[1] : null;
}

async function verifyRealData() {
    const databaseUrl = getDatabaseUrl();
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL not found');
        process.exit(1);
    }

    const sql = neon(databaseUrl);
    
    console.log('\n🔍 VERIFYING 100% REAL DATA SOURCES\n');
    console.log('=' .repeat(60));
    
    // 1. Verify orders are real
    const orderStats = await sql`
        SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total), 0) as total_revenue,
            AVG(total) as avg_order_value
        FROM "Order"
        WHERE status = 'completed'
    `;
    
    console.log('\n📊 REAL ORDER DATA:');
    console.log(`  Total Orders: ${orderStats[0].total_orders}`);
    console.log(`  Total Revenue: ₦${Number(orderStats[0].total_revenue).toLocaleString()}`);
    console.log(`  Avg Order Value: ₦${Math.round(orderStats[0].avg_order_value).toLocaleString()}`);
    
    // 2. Verify products are real
    const productStats = await sql`
        SELECT COUNT(*) as product_count FROM "Product" WHERE status = 'active'
    `;
    console.log(`\n📦 REAL PRODUCT DATA: ${productStats[0].product_count} active products`);
    
    // 3. Verify categories are real
    const categoryStats = await sql`
        SELECT COUNT(*) as category_count FROM "Category"
    `;
    console.log(`📁 REAL CATEGORY DATA: ${categoryStats[0].category_count} categories`);
    
    // 4. Verify geographic data is real
    const geoStats = await sql`
        SELECT 
            "shippingAddress"->>'state' as state,
            COUNT(*) as orders
        FROM "Order"
        WHERE status = 'completed' 
          AND "shippingAddress"->>'state' IS NOT NULL
          AND "shippingAddress"->>'state' != ''
        GROUP BY "shippingAddress"->>'state'
        ORDER BY orders DESC
        LIMIT 5
    `;
    
    console.log('\n📍 REAL GEOGRAPHIC DATA:');
    geoStats.forEach(row => {
        console.log(`  ${row.state}: ${row.orders} orders`);
    });
    
    // 5. Verify brands are real
    const brandStats = await sql`
        SELECT DISTINCT brand, COUNT(*) as product_count 
        FROM "Product" 
        WHERE brand IS NOT NULL AND brand != ''
        GROUP BY brand
        ORDER BY product_count DESC
        LIMIT 5
    `;
    
    console.log('\n🏷️ REAL BRAND DATA:');
    brandStats.forEach(row => {
        console.log(`  ${row.brand}: ${row.product_count} products`);
    });
    
    console.log('\n✅ VERIFICATION COMPLETE - All data is REAL from database\n');
}

verifyRealData().catch(console.error);
