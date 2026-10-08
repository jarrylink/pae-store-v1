const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkLastOrder() {
    console.log('\n📊 CHECKING LAST ORDER IN DATABASE\n');
    console.log('='.repeat(50) + '\n');

    try {
        // Get the last order
        const orders = await sql`
            SELECT id, "orderNumber", items, total 
            FROM "Order" 
            ORDER BY id DESC 
            LIMIT 1
        `;

        if (orders.length === 0) {
            console.log('❌ No orders found');
            return;
        }

        const order = orders[0];
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

        console.log(`📋 Order ${order.id}: ${order.orderNumber}`);
        console.log(`   Total: ₦${order.total}`);
        console.log(`   Items in JSON: ${items.length}`);
        
        // Check if any items have type 'accessory'
        let hasAccessories = false;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type === 'accessory') {
                hasAccessories = true;
                break;
            }
        }
        console.log(`   Has accessories in items JSON: ${hasAccessories ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);

        // Check OrderAccessory table
        const accessories = await sql`
            SELECT * FROM "OrderAccessory" WHERE "orderId" = ${order.id}
        `;
        console.log(`   Accessories in OrderAccessory table: ${accessories.length}`);

        if (accessories.length > 0) {
            for (let i = 0; i < accessories.length; i++) {
                const a = accessories[i];
                console.log(`      - ${a.accessoryId}: ${a.quantity} × ₦${a.unit_price} = ₦${a.total_price}`);
            }
        }

        console.log('\n✅ Check complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkLastOrder();