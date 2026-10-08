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
        
        console.log('Order table columns:');
        columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type}`);
        });
        
        // Also check the User table ID type
        const userColumns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'User' 
            AND column_name = 'id'
        `;
        
        console.log('\nUser table id column:');
        console.log(`  - id: ${userColumns[0]?.data_type || 'unknown'}`);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkColumn();
