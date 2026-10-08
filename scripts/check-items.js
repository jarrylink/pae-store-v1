const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkOrderItems() {
    console.log('📦 CHECKING ACTUAL ORDER ITEMS:\n');
    
    // Get all orders with their items
    const orders = await sql
        SELECT id, status, total, items 
        FROM "Order" 
        ORDER BY id DESC 
        LIMIT 10
    ;
    
    let accessoryCount = 0;
    let serviceCount = 0;
    let productCount = 0;
    
    orders.forEach(order => {
        console.log(Order #:  - ₦);
        let items = order.items;
        if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch(e) { items = []; }
        }
        if (Array.isArray(items)) {
            items.forEach(item => {
                const name = item.title || item.name || 'Unknown';
                const type = item.type || 'unknown';
                const hasAccessoryId = item.accessoryId ? 'yes' : 'no';
                const hasServiceId = item.serviceId ? 'yes' : 'no';
                const hasProductId = item.productId ? 'yes' : 'no';
                
                console.log(  - : type=, productId=, accessoryId=, serviceId=);
                
                if (hasAccessoryId === 'yes' || type === 'accessory') accessoryCount++;
                else if (hasServiceId === 'yes' || type === 'service') serviceCount++;
                else if (hasProductId === 'yes' || type === 'product') productCount++;
            });
        }
        console.log('');
    });
    
    console.log('📊 SUMMARY:');
    console.log(  Products: );
    console.log(  Accessories: );
    console.log(  Services: );
}

checkOrderItems();
