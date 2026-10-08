const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL directly from .env.local file
function getDatabaseUrl() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/);
        if (match) {
            return match[1];
        }
    } catch (err) {
        console.error('Error reading .env.local:', err.message);
    }
    
    // Fallback to environment variable
    return process.env.DATABASE_URL;
}

const databaseUrl = getDatabaseUrl();
if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
}

const sql = neon(databaseUrl);

async function study() {
    console.log('\n🔍 REVENUE & SALES - CURRENT STATE ANALYSIS\n');
    console.log('='.repeat(60));
    
    try {
        // 1. Orders
        const orders = await sql`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) as revenue,
                MIN(created_at) as first,
                MAX(created_at) as last
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
        
        // 8. Sales channels from actual data
        if (hasPaymentMethod[0].exists) {
            const channels = await sql`
                SELECT payment_method, COUNT(*) as count 
                FROM "Order" 
                WHERE status = 'completed' 
                GROUP BY payment_method
            `;
            console.log(`\n💳 EXISTING CHANNELS:`);
            channels.forEach(c => {
                console.log(`   ${c.payment_method}: ${c.count} orders`);
            });
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('\n📋 REQUIRED FOR COMPLETE REVENUE & SALES:\n');
        
        const missing = [];
        if (!hasOrderItem[0].exists) missing.push('❌ OrderItem table (needed for top products)');
        if (!hasPaymentMethod[0].exists) missing.push('❌ payment_method column (needed for sales channels)');
        if (geo[0].has_state < geo[0].total) missing.push('⚠️ Geographic data incomplete - run fix script');
        
        if (missing.length === 0) {
            console.log('✅ DATABASE IS READY! All Revenue & Sales features can be implemented with real data.');
        } else {
            missing.forEach(m => console.log(m));
            console.log('\n📝 Run the following scripts to fix missing items:');
            if (!hasOrderItem[0].exists) console.log('   - Create OrderItem table');
            if (!hasPaymentMethod[0].exists) console.log('   - Add payment_method column');
            if (geo[0].has_state < geo[0].total) console.log('   - Run geographic fix script');
        }
        
    } catch (err) {
        console.error('Error:', err.message);
    }
}

study();
