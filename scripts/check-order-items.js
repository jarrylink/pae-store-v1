const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkOrderItems() {
    try {
        console.log('📦 CHECKING ORDER ITEMS STRUCTURE:\n');
        
        const orders = await sql`
            SELECT id, items, total 
            FROM "Order" 
            ORDER BY id DESC 
            LIMIT 5
        `;
        
        orders.forEach(o => {
            console.log(`Order #${o.id}:`);
            console.log(`  Total: ${o.total}`);
            console.log(`  Items type: ${typeof o.items}`);
            
            let items = o.items;
            if (typeof items === 'string') {
                items = JSON.parse(items);
            }
            
            if (Array.isArray(items)) {
                items.forEach((item, index) => {
                    console.log(`  Item ${index + 1}:`);
                    console.log(`    ${JSON.stringify(item, null, 2)}`);
                });
            } else {
                console.log(`  Items: ${JSON.stringify(items, null, 2)}`);
            }
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkOrderItems();
