const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkColumn() {
    try {
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Order' 
            AND column_name IN ('assignedStaffId', 'assignedStaffName')
        `;
        
        console.log('Current Order table column types:');
        columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type}`);
        });
        
        // Test a sample query with the staff ID
        const staffId = 'user-1774880561989-1gy0oh0';
        console.log(`\nTesting query with staff ID: ${staffId}`);
        
        const testQuery = await sql`
            SELECT COUNT(*) as count
            FROM "Order" 
            WHERE "assignedStaffId" = ${staffId}
        `;
        
        console.log(`Query successful! Found ${testQuery[0].count} orders`);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkColumn();
