const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function verifyAssignments() {
    try {
        console.log('🔍 Verifying order assignments...\n');
        
        const assignedOrders = await sql`
            SELECT 
                o.id,
                o."orderNumber",
                o.status,
                o."assignedStaffName",
                u."firstName" as staff_first,
                u."lastName" as staff_last
            FROM "Order" o
            LEFT JOIN "User" u ON o."assignedStaffId" = u.id
            WHERE o."assignedStaffId" IS NOT NULL
            ORDER BY o."createdAt" DESC
        `;
        
        if (assignedOrders.length === 0) {
            console.log('❌ No orders have been assigned to staff yet');
        } else {
            console.log(`✅ Found ${assignedOrders.length} assigned orders:\n`);
            assignedOrders.forEach(o => {
                console.log(`  Order: ${o.orderNumber}`);
                console.log(`    Status: ${o.status}`);
                console.log(`    Assigned to: ${o.assignedStaffName || o.staff_first + ' ' + o.staff_last}`);
                console.log('');
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

verifyAssignments();
