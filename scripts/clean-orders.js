const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function cleanOrders() {
    console.log('🧹 Cleaning orders - removing accessories from items JSON...\n');

    try {
        const orders = await sql`
            SELECT id, items FROM "Order"
        `;

        let fixed = 0;
        for (const order of orders) {
            let items = typeof order.items === 'string' 
                ? JSON.parse(order.items) 
                : order.items;

            // Filter out accessories
            const filteredItems = items.filter(function(item) {
                return item.type !== 'accessory';
            });

            if (filteredItems.length !== items.length) {
                await sql`
                    UPDATE "Order" 
                    SET items = ${JSON.stringify(filteredItems)}
                    WHERE id = ${order.id}
                `;
                console.log(`✅ Order ${order.id}: Removed ${items.length - filteredItems.length} accessories`);
                fixed++;
            }
        }

        console.log(`\n✅ Cleaned ${fixed} orders!`);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

cleanOrders();