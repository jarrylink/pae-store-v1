const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkOrderAccessories() {
    console.log('?? Checking Order 29 Accessories\n');
    console.log('='.repeat(50) + '\n');

    try {
        // Check if order 29 exists
        const order = await sql
            SELECT id, "orderNumber", total, status 
            FROM "Order" 
            WHERE id = 29
        ;
        
        if (order.length === 0) {
            console.log('? Order 29 not found');
            return;
        }
        
        console.log('?? Order 29 found:');
        console.log(   ID: );
        console.log(   Order Number: );
        console.log(   Total: ?);
        console.log(   Status: );

        // Check if there are accessories for this order
        const accessories = await sql
            SELECT 
                oa.*,
                a.name,
                a.sku,
                a.category
            FROM "OrderAccessory" oa
            LEFT JOIN "Accessory" a ON oa."accessoryId" = a.id
            WHERE oa."orderId" = 29
        ;
        
        console.log(\n?? Accessories found: );
        if (accessories.length > 0) {
            accessories.forEach(acc => {
                console.log(   - :  × ? = ?);
            });
        } else {
            console.log('   No accessories found in OrderAccessory table');
        }

        // Check if accessories are in the Order table's items JSON
        const orderItems = await sql
            SELECT items FROM "Order" WHERE id = 29
        ;
        
        if (orderItems[0].items) {
            const items = typeof orderItems[0].items === 'string' 
                ? JSON.parse(orderItems[0].items) 
                : orderItems[0].items;
            
            const accessoryItems = items.filter((item: any) => item.type === 'accessory');
            console.log(\n?? Accessories in items JSON: );
        }

    } catch (error) {
        console.error('? Error:', error.message);
    }
}

checkOrderAccessories();
