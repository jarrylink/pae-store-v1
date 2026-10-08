const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function study() {
    console.log('\n🔍 REVENUE & SALES - CURRENT STATE ANALYSIS\n');
    console.log('='.repeat(60));
    
    try {
        // 1. Orders
        const orders = await sql`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) as revenue
            FROM "Order"
        `;
        console.log('\n📊 ORDERS:');
        console.log(`   Total Orders: ${orders[0].total}`);
        console.log(`   Completed: ${orders[0].completed}`);
        console.log(`   Revenue: ₦${Number(orders[0].revenue).toLocaleString()}`);
        
        // 2. Check for OrderItem table
        const hasOrderItem = await sql`
            SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'OrderItem')
        `;
        console.log(`\n📦 ORDER_ITEM TABLE: ${hasOrderItem[0].exists ? 'EXISTS' : 'MISSING'}`);
        
        // 3. Check payment_method column
        const hasPaymentMethod = await sql`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'Order' AND column_name = 'payment_method'
            )
        `;
        console.log(`\n💳 PAYMENT_METHOD COLUMN: ${hasPaymentMethod[0].exists ? 'EXISTS' : 'MISSING'}`);
        
        // 4. Geographic data quality
        const geo = await sql`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN "shippingAddress"->>'state' IS NOT NULL AND "shippingAddress"->>'state' != '' THEN 1 END) as has_state
            FROM "Order"
            WHERE status = 'completed'
        `;
        const geoPercent = geo[0].total > 0 ? Math.round(geo[0].has_state / geo[0].total * 100) : 0;
        console.log(`\n📍 GEOGRAPHIC DATA: ${geo[0].has_state}/${geo[0].total} orders have state (${geoPercent}%)`);
        
        // 5. Products
        const products = await sql`
            SELECT COUNT(*) as active FROM "Product" WHERE status = 'active'
        `;
        console.log(`\n🏷️ PRODUCTS: ${products[0].active} active products`);
        
        // 6. Categories
        const categories = await sql`
            SELECT COUNT(*) FROM "Category"
        `;
        console.log(`📁 CATEGORIES: ${categories[0].count}`);
        
        // 7. Brands
        const brands = await sql`
            SELECT COUNT(DISTINCT brand) FROM "Product" WHERE brand IS NOT NULL AND brand != ''
        `;
        console.log(`🏢 BRANDS: ${brands[0].count}`);
        
        console.log('\n' + '='.repeat(60));
        console.log('\n📋 REQUIRED FOR COMPLETE REVENUE & SALES:\n');
        
        const missing = [];
        if (!hasOrderItem[0].exists) missing.push('❌ OrderItem table (needed for top products)');
        if (!hasPaymentMethod[0].exists) missing.push('❌ payment_method column (needed for sales channels)');
        if (geo[0].has_state < geo[0].total) missing.push('⚠️ Geographic data incomplete');
        
        if (missing.length === 0) {
            console.log('✅ DATABASE IS READY! All Revenue & Sales features can be implemented with real data.');
        } else {
            missing.forEach(m => console.log(m));
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

study();
