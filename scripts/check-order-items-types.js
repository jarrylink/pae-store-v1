const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkOrderItems() {
    try {
        console.log('📦 CHECKING ORDER ITEMS BY TYPE:\n');
        
        // Get orders with accessories
        const ordersWithAccessories = await sql`
            SELECT id, items, total, status 
            FROM "Order" 
            WHERE items::text LIKE '%accessory%' 
            LIMIT 5
        `;
        
        console.log('📎 Orders with "accessory" in items:');
        ordersWithAccessories.forEach(o => {
            console.log(`  Order #${o.id}: ${o.status} - ${o.total}`);
            let items = o.items;
            if (typeof items === 'string') items = JSON.parse(items);
            items.forEach((item: any) => {
                if (item.type === 'accessory' || item.accessoryId) {
                    console.log(`    - ${item.title || item.name}: type=${item.type}, accessoryId=${item.accessoryId}`);
                }
            });
        });
        
        // Get orders with services
        const ordersWithServices = await sql`
            SELECT id, items, total, status 
            FROM "Order" 
            WHERE items::text LIKE '%service%' 
            LIMIT 5
        `;
        
        console.log('\n🔧 Orders with "service" in items:');
        ordersWithServices.forEach(o => {
            console.log(`  Order #${o.id}: ${o.status} - ${o.total}`);
            let items = o.items;
            if (typeof items === 'string') items = JSON.parse(items);
            items.forEach((item: any) => {
                if (item.type === 'service' || item.serviceId) {
                    console.log(`    - ${item.title || item.name}: type=${item.type}, serviceId=${item.serviceId}`);
                }
            });
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkOrderItems();
