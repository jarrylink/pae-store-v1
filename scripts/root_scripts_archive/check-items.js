const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkItems() {
    console.log('\n🔍 EXAMINING ITEMS JSONB DATA\n');
    console.log('='.repeat(60));
    
    // Get sample orders with their items
    const ordersWithItems = await sql`
        SELECT 
            id,
            "orderNumber",
            status,
            items,
            total
        FROM "Order"
        WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
        LIMIT 5
    `;
    
    console.log('\n📦 SAMPLE ORDER ITEMS:\n');
    ordersWithItems.forEach(order => {
        console.log(`Order ${order.orderNumber} (${order.status}):`);
        console.log(`  Total: ₦${order.total}`);
        console.log(`  Items structure:`, JSON.stringify(order.items, null, 2));
        console.log('');
    });
    
    // Check what keys exist in the items JSON
    const itemKeys = await sql`
        SELECT DISTINCT jsonb_object_keys(items->0) as key_name
        FROM "Order", jsonb_array_elements(items) as items
        WHERE items IS NOT NULL AND jsonb_typeof(items) = 'object'
        LIMIT 20
    `;
    
    console.log('\n🔑 AVAILABLE FIELDS IN ITEMS JSON:');
    itemKeys.forEach(k => {
        console.log(`  - ${k.key_name}`);
    });
}

checkItems();
