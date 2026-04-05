const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkSchema() {
    try {
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Product'
            ORDER BY ordinal_position
        `;
        console.log('Product table columns:');
        columns.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type})`);
        });
        
        const sample = await sql`
            SELECT id, title, inventory, price, "inStock" 
            FROM "Product" 
            LIMIT 3
        `;
        console.log('\nSample products:');
        console.table(sample);
        
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkSchema();
