const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function assignOrders() {
    try {
        // Get all staff users
        const staffMembers = await sql`
            SELECT id, "firstName", "lastName", email
            FROM "User"
            WHERE role = 'staff' AND "isActive" = true
        `;
        
        if (staffMembers.length === 0) {
            console.log('No staff users found');
            return;
        }
        
        console.log('Staff members:');
        staffMembers.forEach(s => {
            console.log(`  - ${s.firstName} ${s.lastName} (${s.id})`);
        });
        
        // Get pending orders
        const pendingOrders = await sql`
            SELECT id, "orderNumber"
            FROM "Order"
            WHERE status = 'pending'
            ORDER BY "createdAt" DESC
        `;
        
        if (pendingOrders.length === 0) {
            console.log('No pending orders found');
            return;
        }
        
        console.log(`\nFound ${pendingOrders.length} pending orders`);
        
        // Assign orders to staff members in round-robin
        let staffIndex = 0;
        for (const order of pendingOrders) {
            const staff = staffMembers[staffIndex % staffMembers.length];
            
            await sql`
                UPDATE "Order"
                SET 
                    "assignedStaffId" = ${staff.id},
                    "assignedStaffName" = ${staff.firstName + ' ' + staff.lastName},
                    "assignedStaffEmail" = ${staff.email}
                WHERE id = ${order.id}
            `;
            
            console.log(`✅ Order ${order.orderNumber} assigned to ${staff.firstName} ${staff.lastName}`);
            staffIndex++;
        }
        
        // Show summary
        console.log('\n📋 Assignment Summary:');
        for (const staff of staffMembers) {
            const count = await sql`
                SELECT COUNT(*) as count
                FROM "Order"
                WHERE "assignedStaffId" = ${staff.id}
            `;
            console.log(`  - ${staff.firstName} ${staff.lastName}: ${count[0].count} orders`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

assignOrders();
