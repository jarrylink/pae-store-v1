const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function testInventory() {
    try {
        // Check current inventory
        const products = await sql`
            SELECT id, title, inventory 
            FROM "Product" 
            ORDER BY id
        `;
        console.log('Current inventory:');
        console.table(products);
        
        // Check pending orders
        const pendingOrders = await sql`
            SELECT id, "orderNumber", items, status
            FROM "Order" 
            WHERE status = 'pending'
            LIMIT 3
        `;
        console.log('\nPending orders:', pendingOrders.length);
        
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testInventory();
