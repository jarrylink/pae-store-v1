const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkOrder29Direct() {
    console.log('?? Direct Database Check for Order 29\n');
    console.log('='.repeat(50) + '\n');

    try {
        // Check OrderAccessory table for order 29
        const accessories = await sql
            SELECT 
                oa.*,
                a.name,
                a.sku
            FROM "OrderAccessory" oa
            LEFT JOIN "Accessory" a ON oa."accessoryId" = a.id
            WHERE oa."orderId" = 29
        ;
        
        console.log(?? Found  accessories in OrderAccessory table for order 29);
        if (accessories.length > 0) {
            accessories.forEach(acc => {
                console.log(   - :  × ? = ?);
            });
        } else {
            console.log('   ? No accessories found!');
        }

        // Also check the Order table's items JSON
        const order = await sql
            SELECT items FROM "Order" WHERE id = 29
        ;
        
        if (order.length > 0 && order[0].items) {
            const items = typeof order[0].items === 'string' 
                ? JSON.parse(order[0].items) 
                : order[0].items;
            
            const accessoryItems = items.filter((item: any) => item.type === 'accessory');
            console.log(\n?? Found  accessories in items JSON);
        }

        // Check if the order exists
        const orderExists = await sql
            SELECT id FROM "Order" WHERE id = 29
        ;
        console.log(\n?? Order 29 exists: );

    } catch (error) {
        console.error('? Error:', error.message);
    }
}

checkOrder29Direct();
