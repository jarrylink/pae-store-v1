const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkAddressTable() {
    try {
        // Check if Address table exists
        const tableExists = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'Address'
            );
        `;
        
        console.log('Address table exists:', tableExists[0].exists);
        
        if (tableExists[0].exists) {
            // Get table structure
            const columns = await sql`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'Address'
                ORDER BY ordinal_position
            `;
            console.log('\nAddress table columns:');
            columns.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type}`);
            });
            
            // Get count of addresses
            const count = await sql`SELECT COUNT(*) FROM "Address"`;
            console.log(`\nTotal addresses in database: ${count[0].count}`);
            
            // Get sample addresses
            const addresses = await sql`SELECT * FROM "Address" LIMIT 5`;
            if (addresses.length > 0) {
                console.log('\nSample addresses:');
                addresses.forEach(addr => {
                    console.log(`  - ID: ${addr.id}, Type: ${addr.type}, City: ${addr.city}`);
                });
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkAddressTable();
