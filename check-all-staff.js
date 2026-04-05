const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkAllStaff() {
    try {
        console.log('🔍 Checking ALL staff users in database...\n');
        
        const staffUsers = await sql`
            SELECT id, email, "firstName", "lastName", role, "isActive"
            FROM "User"
            WHERE role = 'staff'
            ORDER BY email
        `;
        
        console.log('📋 Staff users found:', staffUsers.length);
        staffUsers.forEach(user => {
            console.log(`\n  Email: ${user.email}`);
            console.log(`  Name: ${user.firstName} ${user.lastName}`);
            console.log(`  ID: ${user.id}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Active: ${user.isActive}`);
            console.log('  ---');
        });
        
        // Check assigned orders for each staff
        console.log('\n📦 Assigned orders per staff:');
        for (const staff of staffUsers) {
            const orders = await sql`
                SELECT COUNT(*) as count, string_agg("orderNumber", ', ') as orders
                FROM "Order"
                WHERE "assignedStaffId" = ${staff.id}
            `;
            console.log(`  ${staff.firstName} ${staff.lastName}: ${orders[0].count} orders`);
            if (orders[0].orders) {
                console.log(`    Orders: ${orders[0].orders}`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkAllStaff();
