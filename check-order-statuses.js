const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkOrderStatuses() {
    try {
        // Get all unique order statuses
        const statuses = await sql`
            SELECT DISTINCT status, COUNT(*) as count
            FROM "Order"
            GROUP BY status
            ORDER BY status
        `;
        
        console.log('📊 Current Order Statuses:');
        console.table(statuses);
        
        // Check Product inventory structure
        const productSample = await sql`
            SELECT id, title, "inStock", inventory
            FROM "Product"
            LIMIT 3
        `;
        
        console.log('\n📦 Sample Products (inventory tracking):');
        console.table(productSample);
        
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkOrderStatuses();
