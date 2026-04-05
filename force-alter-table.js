const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function forceAlterTable() {
    try {
        console.log('🔧 Forcing Order table alteration...');
        
        // First, drop the column if it exists (we'll recreate it)
        const columnExists = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Order' 
            AND column_name = 'assignedStaffId'
        `;
        
        if (columnExists.length > 0) {
            console.log('Dropping existing assignedStaffId column...');
            await sql`
                ALTER TABLE "Order" DROP COLUMN "assignedStaffId"
            `;
        }
        
        // Add new column with TEXT type
        console.log('Adding new assignedStaffId column as TEXT...');
        await sql`
            ALTER TABLE "Order" ADD COLUMN "assignedStaffId" TEXT
        `;
        
        // Add assignedStaffName if it doesn't exist
        const nameColumnExists = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Order' 
            AND column_name = 'assignedStaffName'
        `;
        
        if (nameColumnExists.length === 0) {
            await sql`
                ALTER TABLE "Order" ADD COLUMN "assignedStaffName" TEXT
            `;
        }
        
        // Add assignedStaffEmail if it doesn't exist
        const emailColumnExists = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Order' 
            AND column_name = 'assignedStaffEmail'
        `;
        
        if (emailColumnExists.length === 0) {
            await sql`
                ALTER TABLE "Order" ADD COLUMN "assignedStaffEmail" TEXT
            `;
        }
        
        console.log('✅ Table alteration complete!');
        
        // Verify the changes
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Order' 
            AND column_name IN ('assignedStaffId', 'assignedStaffName', 'assignedStaffEmail')
        `;
        
        console.log('\nUpdated columns:');
        columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type}`);
        });
        
    } catch (error) {
        console.error('Error altering table:', error.message);
    }
}

forceAlterTable();
