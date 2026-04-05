const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function updateOrderTable() {
    try {
        // Check if assignedStaffId column exists
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Order' 
        `;
        
        const columnNames = columns.map(c => c.column_name);
        
        if (!columnNames.includes('assignedStaffId')) {
            console.log('Adding assignment columns to Order table...');
            await sql`
                ALTER TABLE "Order" 
                ADD COLUMN IF NOT EXISTS "assignedStaffId" TEXT,
                ADD COLUMN IF NOT EXISTS "assignedStaffName" TEXT,
                ADD COLUMN IF NOT EXISTS "assignedStaffEmail" TEXT
            `;
            console.log('✅ Assignment columns added to Order table');
        } else {
            console.log('✅ Assignment columns already exist');
        }
        
        console.log('Database update complete!');
    } catch (error) {
        console.error('Error updating table:', error.message);
    }
}

updateOrderTable();
