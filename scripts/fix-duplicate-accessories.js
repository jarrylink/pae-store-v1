const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixDuplicateAccessories() {
    console.log('🔧 Fixing duplicate accessories in orders...\n');

    try {
        const orders = await sql`
            SELECT id, items FROM "Order"
        `;

        let fixed = 0;
        for (const order of orders) {
            const items = typeof order.items === 'string' 
                ? JSON.parse(order.items) 
                : order.items;

            // Filter out accessories from items
            const filteredItems = items.filter(function(item) {
                return item.type !== 'accessory';
            });

            if (filteredItems.length !== items.length) {
                await sql`
                    UPDATE "Order" 
                    SET items = ${JSON.stringify(filteredItems)}
                    WHERE id = ${order.id}
                `;
                console.log(`✅ Order ${order.id}: Removed ${items.length - filteredItems.length} duplicate accessories`);
                fixed++;
            }
        }

        console.log(`\n✅ Fixed ${fixed} orders!`);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixDuplicateAccessories();