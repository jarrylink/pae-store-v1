const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixOrderTotal() {
    console.log('?? Fixing order 29 total\n');

    try {
        // Get order items
        const order = await sql
            SELECT id, items FROM "Order" WHERE id = 29
        ;
        
        if (order.length === 0) {
            console.log('? Order 29 not found');
            return;
        }

        // Parse items
        const items = typeof order[0].items === 'string' 
            ? JSON.parse(order[0].items) 
            : order[0].items;

        // Calculate product total
        let productTotal = 0;
        items.forEach((item: any) => {
            if (item.type !== 'accessory' && item.type !== 'service') {
                productTotal += Number(item.price) * Number(item.quantity);
            }
        });
        console.log(?? Product total: );

        // Get accessories total
        const accessories = await sql
            SELECT SUM(total_price) as total FROM "OrderAccessory" WHERE "orderId" = 29
        ;
        const accessoryTotal = Number(accessories[0].total || 0);
        console.log(?? Accessory total: );

        // Get service total from order
        const serviceTotal = Number(order[0].servicePrice || 0);
        console.log(?? Service total: );

        // Calculate new total
        const newTotal = productTotal + accessoryTotal + serviceTotal;
        console.log(?? New total: );

        // Update the order
        await sql
            UPDATE "Order" 
            SET total = , "updatedAt" = NOW()
            WHERE id = 29
        ;
        console.log('? Order 29 total updated!');

    } catch (error) {
        console.error('? Error:', error.message);
    }
}

fixOrderTotal();
