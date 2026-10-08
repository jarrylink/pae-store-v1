const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkStaffAndOrders() {
    try {
        // 1. Check staff users
        console.log('👥 Staff Users:');
        const staff = await sql`
            SELECT id, "firstName", "lastName", email, role 
            FROM "User" 
            WHERE role = 'staff' AND "isActive" = true
        `;
        console.table(staff);
        
        // 2. Check if orders have assignedStaffId column
        console.log('\n📋 Order Table Columns:');
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Order'
            ORDER BY ordinal_position
        `;
        columns.forEach(col => {
            if (col.column_name.includes('staff')) {
                console.log(`  - ${col.column_name} (${col.data_type})`);
            }
        });
        
        // 3. Check sample orders with assignments
        console.log('\n📦 Sample Orders with Staff Assignments:');
        const orders = await sql`
            SELECT id, "orderNumber", "assignedStaffId", "assignedStaffName", status
            FROM "Order" 
            LIMIT 5
        `;
        console.table(orders);
        
        // 4. Check if any orders have staff assigned
        const assignedOrders = await sql`
            SELECT COUNT(*) as count 
            FROM "Order" 
            WHERE "assignedStaffId" IS NOT NULL
        `;
        console.log(`\n✅ Orders with staff assigned: ${assignedOrders[0].count}`);
        
        // 5. Verify foreign key relationship would work
        if (staff.length > 0) {
            console.log('\n🔗 Staff IDs for assignment:');
            staff.forEach(s => {
                console.log(`  - ${s.id} (${s.firstName} ${s.lastName}) - Type: ${typeof s.id}`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkStaffAndOrders();
