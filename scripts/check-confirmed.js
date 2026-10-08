const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkConfirmedOrders() {
    console.log('💰 CHECKING CONFIRMED ORDERS (REVENUE):\n');
    
    const orders = await sql
        SELECT id, status, total, items 
        FROM "Order" 
        WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
    ;
    
    let totalRevenue = 0;
    let accessoryRevenue = 0;
    let serviceRevenue = 0;
    let productRevenue = 0;
    
    orders.forEach(order => {
        console.log(Order #:  - ₦);
        let items = order.items;
        if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch(e) { items = []; }
        }
        if (Array.isArray(items)) {
            items.forEach(item => {
                const name = item.title || item.name || 'Unknown';
                const price = Number(item.price) || 0;
                const qty = Number(item.quantity) || 1;
                const total = price * qty;
                
                if (item.accessoryId || item.type === 'accessory') {
                    accessoryRevenue += total;
                    console.log(  📎 : ₦ (accessory));
                } else if (item.serviceId || item.type === 'service') {
                    serviceRevenue += total;
                    console.log(  🔧 : ₦ (service));
                } else {
                    productRevenue += total;
                    console.log(  📦 : ₦ (product));
                }
            });
        }
        totalRevenue += order.total;
        console.log('');
    });
    
    console.log('📊 REVENUE BREAKDOWN:');
    console.log(  Total Revenue: ₦);
    console.log(  Products: ₦);
    console.log(  Accessories: ₦);
    console.log(  Services: ₦);
}

checkConfirmedOrders();
