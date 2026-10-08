const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function completeAudit() {
    console.log('\n🔍 COMPLETE DATABASE AUDIT FOR REVENUE & SALES\n');
    console.log('='.repeat(70));
    
    // 1. ALL ORDER STATUSES - using correct camelCase column names
    const allStatuses = await sql`
        SELECT 
            status,
            COUNT(*) as count,
            SUM(total) as total_value,
            MIN("createdAt") as first_order,
            MAX("createdAt") as last_order
        FROM "Order"
        GROUP BY status
        ORDER BY 
            CASE status
                WHEN 'pending' THEN 1
                WHEN 'confirmed' THEN 2
                WHEN 'processing' THEN 3
                WHEN 'shipped' THEN 4
                WHEN 'delivered' THEN 5
                WHEN 'cancelled' THEN 6
                WHEN 'refunded' THEN 7
                ELSE 8
            END
    `;
    
    console.log('\n📊 ALL ORDER STATUSES IN SYSTEM:\n');
    allStatuses.forEach(s => {
        console.log(`  ${s.status.toUpperCase()}:`);
        console.log(`     Orders: ${s.count}`);
        console.log(`     Value: ₦${Number(s.total_value).toLocaleString()}`);
        if (s.first_order) {
            console.log(`     Date Range: ${new Date(s.first_order).toLocaleDateString()} - ${new Date(s.last_order).toLocaleDateString()}`);
        }
        console.log('');
    });
    
    // 2. Check payment column (correct case)
    const columns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Order'
        AND column_name ILIKE '%payment%'
    `;
    console.log('\n💳 PAYMENT-RELATED COLUMNS:', columns.map(c => c.column_name));
    
    // 3. TOP PRODUCTS (using correct column names)
    const topProducts = await sql`
        SELECT 
            items->>'name' as name,
            COUNT(*) as times_ordered,
            SUM(CAST(items->>'price' AS DECIMAL)) as total_revenue
        FROM "Order",
        jsonb_array_elements(items) as items
        WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
          AND items->>'name' IS NOT NULL
          AND items->>'name' != ''
        GROUP BY items->>'name'
        ORDER BY times_ordered DESC
        LIMIT 10
    `;
    
    console.log('\n🏆 TOP PRODUCTS (from confirmed+ orders):\n');
    if (topProducts.length > 0) {
        topProducts.forEach(p => {
            console.log(`  ${p.name}: ${p.times_ordered} orders, ₦${Number(p.total_revenue).toLocaleString()}`);
        });
    } else {
        console.log('  No products found in confirmed+ orders');
    }
    
    // 4. Delivered orders
    const delivered = await sql`
        SELECT 
            COUNT(*) as count,
            SUM(total) as revenue,
            array_agg("orderNumber") as order_numbers
        FROM "Order"
        WHERE status = 'delivered'
    `;
    
    console.log(`\n🚚 DELIVERED ORDERS: ${delivered[0].count} orders, ₦${Number(delivered[0].revenue).toLocaleString()}`);
    if (delivered[0].count > 0 && delivered[0].order_numbers) {
        console.log(`   Order numbers: ${delivered[0].order_numbers.join(', ')}`);
    }
    
    // 5. Geographic data quality
    const geoQuality = await sql`
        SELECT 
            COUNT(*) as total_orders,
            COUNT(CASE WHEN "shippingAddress"->>'state' IS NOT NULL AND "shippingAddress"->>'state' != '' THEN 1 END) as has_state,
            COUNT(CASE WHEN "shippingAddress"->>'city' IS NOT NULL AND "shippingAddress"->>'city' != '' THEN 1 END) as has_city
        FROM "Order"
        WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
    `;
    
    console.log(`\n📍 GEOGRAPHIC DATA QUALITY:`);
    console.log(`   Total orders: ${geoQuality[0].total_orders}`);
    if (geoQuality[0].total_orders > 0) {
        console.log(`   Have state: ${geoQuality[0].has_state} (${((geoQuality[0].has_state/geoQuality[0].total_orders)*100).toFixed(1)}%)`);
        console.log(`   Have city: ${geoQuality[0].has_city} (${((geoQuality[0].has_city/geoQuality[0].total_orders)*100).toFixed(1)}%)`);
    }
    
    // 6. Revenue by status
    const revenueByStatus = await sql`
        SELECT 
            status,
            COUNT(*) as orders,
            SUM(total) as revenue
        FROM "Order"
        GROUP BY status
        ORDER BY revenue DESC
    `;
    
    console.log(`\n💰 REVENUE BY STATUS:`);
    revenueByStatus.forEach(r => {
        console.log(`   ${r.status}: ₦${Number(r.revenue).toLocaleString()} (${r.orders} orders)`);
    });
    
    // 7. Final assessment
    console.log('\n' + '='.repeat(70));
    console.log('\n🎯 READINESS ASSESSMENT:\n');
    
    const hasRevenueOrders = allStatuses.some(s => ['confirmed', 'processing', 'shipped', 'delivered'].includes(s.status) && parseInt(s.count) > 0);
    const hasProducts = topProducts.length > 0;
    const hasPaymentMethod = columns.some(c => c.column_name === 'paymentMethod');
    const hasGeographic = geoQuality[0].has_state === geoQuality[0].total_orders && geoQuality[0].total_orders > 0;
    
    console.log(`✅ Revenue-generating orders exist: ${hasRevenueOrders ? 'YES' : 'NO'}`);
    console.log(`✅ Product data available: ${hasProducts ? 'YES' : 'NO'}`);
    console.log(`✅ Payment method tracking: ${hasPaymentMethod ? 'YES' : 'NO'}`);
    console.log(`⚠️ Geographic data complete: ${hasGeographic ? 'YES' : 'NO - needs state names'}`);
    
    console.log('\n📋 VERDICT:');
    if (hasRevenueOrders && hasProducts && hasPaymentMethod) {
        console.log('✅ REVENUE & SALES TAB CAN BE BUILT WITH REAL DATA');
        if (!hasGeographic) {
            console.log('⚠️ Geographic will show "Unknown" until shippingAddress.state is populated');
        }
        console.log('\n📊 WHAT WILL WORK IMMEDIATELY:');
        console.log('   • Total Revenue: ₦' + revenueByStatus.filter(r => ['confirmed','processing','shipped','delivered'].includes(r.status)).reduce((sum,r) => sum + Number(r.revenue), 0).toLocaleString());
        console.log('   • Pipeline Value: ₦' + (revenueByStatus.find(r => r.status === 'pending')?.revenue?.toLocaleString() || '0'));
        console.log('   • Top Products: ' + (topProducts.length > 0 ? topProducts[0]?.name : 'None'));
        console.log('   • Sales Channels: ' + (paymentMethod ? 'paymentMethod column exists' : 'Not tracking'));
    } else {
        console.log('❌ Missing critical components. See above for details.');
        if (!hasRevenueOrders) console.log('   - No revenue-generating orders found');
        if (!hasProducts) console.log('   - No product data found');
        if (!hasPaymentMethod) console.log('   - paymentMethod column missing');
    }
}

completeAudit();
