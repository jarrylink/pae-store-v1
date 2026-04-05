const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkOrders() {
    try {
        // Get count of orders
        const count = await sql`SELECT COUNT(*) FROM "Order"`;
        console.log(`\n📊 Total orders in database: ${count[0].count}`);
        
        // Get latest 3 orders with customer names
        const orders = await sql`
            SELECT id, "orderNumber", "customerName", total, status, "createdAt"
            FROM "Order" 
            ORDER BY "createdAt" DESC 
            LIMIT 3
        `;
        
        console.log('\n📦 Latest orders:');
        orders.forEach(order => {
            console.log(`  - Order #${order.id}: ${order.customerName} - ₦${order.total} (${order.status})`);
        });
        
        // Check if there are any orders with userId from your test user
        const userOrders = await sql`
            SELECT COUNT(*) FROM "Order" WHERE "userId" = 'user-1773229531941-tw4gnzz'
        `;
        console.log(`\n👤 Orders for test user: ${userOrders[0].count}`);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

checkOrders();
