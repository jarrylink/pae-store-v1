const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function assignToBothStaff() {
    try {
        // Get both staff members
        const staffMembers = await sql`
            SELECT id, "firstName", "lastName", email
            FROM "User"
            WHERE role = 'staff' AND "isActive" = true
            ORDER BY "firstName"
        `;
        
        if (staffMembers.length === 0) {
            console.log('No staff users found');
            return;
        }
        
        console.log('👥 Staff members found:');
        staffMembers.forEach(s => {
            console.log(`  - ${s.firstName} ${s.lastName} (${s.id}) - ${s.email}`);
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
        
        console.log(`\n📦 Found ${pendingOrders.length} pending orders`);
        
        // Assign orders to both staff members (round-robin)
        for (let i = 0; i < pendingOrders.length; i++) {
            const order = pendingOrders[i];
            const staff = staffMembers[i % staffMembers.length];
            
            // Check if already assigned
            const current = await sql`
                SELECT "assignedStaffId" FROM "Order" WHERE id = ${order.id}
            `;
            
            if (!current[0].assignedStaffId) {
                await sql`
                    UPDATE "Order"
                    SET 
                        "assignedStaffId" = ${staff.id},
                        "assignedStaffName" = ${staff.firstName + ' ' + staff.lastName},
                        "assignedStaffEmail" = ${staff.email}
                    WHERE id = ${order.id}
                `;
                console.log(`✅ Order ${order.orderNumber} → ${staff.firstName} ${staff.lastName}`);
            }
        }
        
        // Show summary
        console.log('\n📊 Assignment Summary:');
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

assignToBothStaff();
