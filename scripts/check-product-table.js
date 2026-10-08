const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkProductTable() {
    try {
        console.log('📊 PRODUCT TABLE STRUCTURE:\n');
        
        // Get all columns
        const columns = await sql`
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'Product'
            ORDER BY ordinal_position
        `;
        
        console.log('Columns in Product table:');
        columns.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL';
            const defaultVal = col.column_default ? ` (default: ${col.column_default})` : '';
            console.log(`  - ${col.column_name}: ${col.data_type} (${nullable})${defaultVal}`);
        });
        
        // Check if purchasePrice column exists
        const hasPurchasePrice = columns.some(c => c.column_name === 'purchasePrice' || c.column_name === 'purchase_price');
        console.log(`\n✅ Has purchasePrice column: ${hasPurchasePrice ? 'YES' : 'NO'}`);
        
        // Show sample data
        console.log('\n📦 Sample product data:');
        const products = await sql`
            SELECT id, title, price, "purchasePrice", "createdAt" 
            FROM "Product" 
            LIMIT 5
        `;
        products.forEach(p => {
            console.log(`  ID: ${p.id}, Title: ${p.title}, Price: ${p.price}, PurchasePrice: ${p.purchasePrice || 'NULL'}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkProductTable();
