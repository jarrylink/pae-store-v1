const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
    console.log('?? Checking Order 29\n');
    
    // Get order 29 items
    const order = await sql
        SELECT items FROM "Order" WHERE id = 29
    ;
    
    if (order.length > 0) {
        const items = typeof order[0].items === 'string' 
            ? JSON.parse(order[0].items) 
            : order[0].items;
        
        console.log('?? Items in order:', items.length);
        console.log('?? Item types:', items.map((i: any) => i.type || 'product').join(', '));
        
        const accessories = items.filter((i: any) => i.type === 'accessory');
        console.log('?? Accessories in items:', accessories.length);
        
        if (accessories.length > 0) {
            accessories.forEach((a: any) => {
                console.log(   - :  × ?);
            });
        }
    }
    
    // Check OrderAccessory table
    const oa = await sql
        SELECT * FROM "OrderAccessory" WHERE "orderId" = 29
    ;
    console.log(\n?? OrderAccessory table records: );
}

check();
