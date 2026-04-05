const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkProductTable() {
    try {
        // Get product table columns
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Product'
            ORDER BY ordinal_position
        `;
        
        console.log('📋 Product Table Columns:');
        console.table(columns);
        
        // Get product counts
        const totalProducts = await sql`SELECT COUNT(*) FROM "Product"`;
        console.log(`\n📊 Total Products: ${totalProducts[0].count}`);
        
        // Get products with stock tracking
        const products = await sql`
            SELECT id, title, price, "inStock", inventory, category
            FROM "Product"
            LIMIT 5
        `;
        
        console.log('\n📦 Sample Products:');
        console.table(products);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

checkProductTable();
