const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkProducts() {
    console.log('\n📦 PRODUCT NAMES IN ORDERS:\n');
    
    const orders = await sql`
        SELECT items FROM "Order" WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
    `;
    
    const productNames = new Set();
    
    orders.forEach(order => {
        let items = order.items;
        if (typeof items === 'string') {
            try {
                items = JSON.parse(items);
            } catch(e) {}
        }
        if (Array.isArray(items)) {
            items.forEach(item => {
                if (item.name || item.title) {
                    productNames.add(item.name || item.title);
                }
            });
        }
    });
    
    console.log('Product names found:');
    productNames.forEach(name => {
        console.log(`  - ${name}`);
    });
}

checkProducts();
