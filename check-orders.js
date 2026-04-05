const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkOrders() {
    try {
        // Get staff users
        const staff = await sql`
            SELECT id, email, "firstName", "lastName"
            FROM "User"
            WHERE role = 'staff'
        `;
        
        for (const s of staff) {
            console.log(`\n📋 Orders for ${s.firstName} ${s.lastName} (${s.email}):`);
            const orders = await sql`
                SELECT "orderNumber", status, "assignedStaffName"
                FROM "Order"
                WHERE "assignedStaffId" = ${s.id}
            `;
            
            if (orders.length === 0) {
                console.log('  No orders assigned');
            } else {
                orders.forEach(o => {
                    console.log(`  - ${o.orderNumber}: ${o.status}`);
                });
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkOrders();
