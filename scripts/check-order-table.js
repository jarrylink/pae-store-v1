const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkOrderTable() {
    console.log('🔍 Checking Order Table Structure\n');
    console.log('='.repeat(50) + '\n');

    try {
        // Get all columns
        const columns = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'Order'
            ORDER BY ordinal_position
        `;
        
        console.log('📋 Order Table Columns:');
        columns.forEach(c => {
            console.log(`   - ${c.column_name}: ${c.data_type} (${c.is_nullable === 'YES' ? 'nullable' : 'required'})`);
        });

        // Check if there's an accessories column or total column
        console.log('\n📊 Checking for accessory-related columns...');
        const hasAccessoriesColumn = columns.some(c => c.column_name === 'accessories');
        const hasAccessoryTotal = columns.some(c => c.column_name === 'accessoryTotal');
        
        console.log(`   - Has 'accessories' column: ${hasAccessoriesColumn ? '✅ YES' : '❌ NO'}`);
        console.log(`   - Has 'accessoryTotal' column: ${hasAccessoryTotal ? '✅ YES' : '❌ NO'}`);

        // Get a sample order with accessories
        console.log('\n📦 Sample order with accessories:');
        const orders = await sql`
            SELECT 
                o.id,
                o."orderNumber",
                o.items,
                o.total,
                o."servicePrice",
                COUNT(oa.id) as accessory_count,
                COALESCE(SUM(oa.total_price), 0) as accessory_total
            FROM "Order" o
            LEFT JOIN "OrderAccessory" oa ON oa."orderId" = o.id
            GROUP BY o.id, o."orderNumber", o.items, o.total, o."servicePrice"
            HAVING COUNT(oa.id) > 0
            LIMIT 3
        `;
        
        if (orders.length > 0) {
            orders.forEach(order => {
                console.log(`\n   Order ${order.id}: ${order.orderNumber}`);
                console.log(`      - Stored total: ₦${order.total}`);
                console.log(`      - Service price: ₦${order.servicePrice || 0}`);
                console.log(`      - Accessory count: ${order.accessory_count}`);
                console.log(`      - Accessory total: ₦${order.accessory_total}`);
            });
        } else {
            console.log('   No orders with accessories found');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkOrderTable();