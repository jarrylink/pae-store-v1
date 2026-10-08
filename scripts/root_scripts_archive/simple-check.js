const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

if (!DATABASE_URL) {
    console.log('DATABASE_URL not found');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
    try {
        // Get Order table columns
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Order'
            ORDER BY ordinal_position
        `;
        
        console.log('Order table columns:');
        columns.forEach(col => {
            console.log('  -', col.column_name);
        });
        
        // Get count of orders
        const count = await sql`SELECT COUNT(*) FROM "Order"`;
        console.log('\nTotal orders:', count[0].count);
        
        // Get a sample order
        const sample = await sql`SELECT * FROM "Order" LIMIT 1`;
        if (sample.length > 0) {
            console.log('\nSample order fields:');
            Object.keys(sample[0]).forEach(key => {
                console.log('  -', key);
            });
        }
        
    } catch (err) {
        console.error('Error:', err.message);
    }
}

main();
