const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkGeographicData() {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('\n🔍 Checking Geographic Data in Database...\n');
    
    // Query 1: Check what states are in the database
    const states = await sql`
        SELECT 
            COALESCE("shippingAddress"->>'state', 'NULL') as state,
            COUNT(*) as order_count,
            COALESCE(SUM(total), 0) as total_revenue
        FROM "Order"
        WHERE status = 'completed'
        GROUP BY "shippingAddress"->>'state'
        ORDER BY total_revenue DESC;
    `;
    
    console.log('📍 Geographic Distribution:');
    console.log('─'.repeat(50));
    if (states.length > 0) {
        states.forEach(row => {
            console.log(`  State: ${row.state}`);
            console.log(`    Orders: ${row.order_count}`);
            console.log(`    Revenue: ₦${Number(row.total_revenue).toLocaleString()}`);
            console.log('');
        });
    } else {
        console.log('  No geographic data found\n');
    }
    
    // Query 2: Check sample orders with shipping addresses
    const sampleOrders = await sql`
        SELECT 
            id,
            status,
            "shippingAddress"->>'state' as state,
            "shippingAddress"->>'city' as city,
            total
        FROM "Order"
        WHERE status = 'completed'
        LIMIT 5;
    `;
    
    console.log('📦 Sample Orders with Shipping Data:');
    console.log('─'.repeat(50));
    sampleOrders.forEach(order => {
        console.log(`  Order ID: ${order.id}`);
        console.log(`    State: ${order.state || 'NULL'}`);
        console.log(`    City: ${order.city || 'NULL'}`);
        console.log(`    Total: ₦${Number(order.total).toLocaleString()}`);
        console.log('');
    });
    
    // Query 3: Update empty states if needed
    const emptyStates = await sql`
        SELECT COUNT(*) as count
        FROM "Order"
        WHERE status = 'completed'
          AND ("shippingAddress"->>'state' IS NULL 
            OR "shippingAddress"->>'state' = ''
            OR "shippingAddress"->>'state' = ' ');
    `;
    
    if (emptyStates[0].count > 0) {
        console.log(`⚠️  Found ${emptyStates[0].count} orders with missing state data`);
        console.log('\nRun this to fix:');
        console.log('  UPDATE "Order" SET "shippingAddress" = jsonb_set(COALESCE("shippingAddress", \'{}\'::jsonb), \'{state}\', \'"Lagos"\') WHERE status = \'completed\' AND ("shippingAddress"->>\'state\' IS NULL OR "shippingAddress"->>\'state\' = \'\');');
    } else {
        console.log('✅ All orders have state data!');
    }
}

checkGeographicData().catch(console.error);
