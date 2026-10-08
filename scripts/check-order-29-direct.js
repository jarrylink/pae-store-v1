const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkOrder29() {
    console.log('?? Checking Order 29\n');
    console.log('='.repeat(50) + '\n');

    try {
        // 1. Check if order exists
        console.log('?? Step 1: Checking Order 29...');
        const order = await sql
            SELECT id, "orderNumber", total, status, "createdAt"
            FROM "Order" 
            WHERE id = 29
        ;
        
        if (order.length === 0) {
            console.log('? Order 29 not found');
            return;
        }
        
        console.log('? Order 29 found:');
        console.log(   ID: );
        console.log(   Order Number: );
        console.log(   Total: ?);
        console.log(   Status: );

        // 2. Check OrderAccessory table for this order
        console.log('\n?? Step 2: Checking OrderAccessory table...');
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
        
        console.log(   Found  accessories in OrderAccessory table);
        if (accessories.length > 0) {
            accessories.forEach(acc => {
                console.log(   - :  × ? = ?);
            });
        }

        // 3. Check items JSON in Order table
        console.log('\n?? Step 3: Checking items JSON in Order table...');
        const orderItems = await sql
            SELECT items FROM "Order" WHERE id = 29
        ;
        
        if (orderItems[0].items) {
            const items = typeof orderItems[0].items === 'string' 
                ? JSON.parse(orderItems[0].items) 
                : orderItems[0].items;
            
            const accessoryItems = items.filter((item: any) => item.type === 'accessory');
            console.log(   Found  accessories in items JSON);
        }

        console.log('\n? Check complete!');

    } catch (error) {
        console.error('? Error:', error.message);
    }
}

checkOrder29();
