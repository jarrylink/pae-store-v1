const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkData() {
    console.log('?? Checking actual database data\n');
    
    // Check order 29 items
    const order = await sql
        SELECT id, items, total, subtotal FROM "Order" WHERE id = 29
    ;
    
    if (order.length > 0) {
        console.log('?? Order 29:');
        console.log('   Total:', order[0].total);
        console.log('   Subtotal:', order[0].subtotal);
        
        const items = typeof order[0].items === 'string' 
            ? JSON.parse(order[0].items) 
            : order[0].items;
        
        console.log('\n?? Items:', JSON.stringify(items, null, 2));
        
        // Calculate totals from items
        let calcTotal = 0;
        items.forEach((item: any) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 0;
            calcTotal += price * qty;
            console.log(   :  ×  = );
        });
        console.log(\n?? Calculated total from items: );
        console.log(?? Stored total in order: );
    }
    
    // Check accessories for order 29
    const accessories = await sql
        SELECT * FROM "OrderAccessory" WHERE "orderId" = 29
    ;
    
    console.log(\n?? Accessories in OrderAccessory table: );
    accessories.forEach((a: any) => {
        console.log(   - :  ×  = );
    });
}

checkData();
