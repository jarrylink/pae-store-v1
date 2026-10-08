const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkAccessoryTable() {
    try {
        console.log('📎 ACCESSORY TABLE STRUCTURE:\n');
        
        const columns = await sql`
            SELECT 
                column_name, 
                data_type, 
                is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'Accessory'
            ORDER BY ordinal_position
        `;
        
        console.log('Columns in Accessory table:');
        columns.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL';
            console.log(`  - ${col.column_name}: ${col.data_type} (${nullable})`);
        });
        
        // Check if costPrice column exists
        const hasCostPrice = columns.some(c => c.column_name === 'costPrice' || c.column_name === 'cost_price');
        console.log(`\n✅ Has costPrice column: ${hasCostPrice ? 'YES' : 'NO'}`);
        
        // Show sample data with costPrice
        console.log('\n📦 Sample accessory data:');
        const accessories = await sql`
            SELECT id, name, price, "costPrice" 
            FROM "Accessory" 
            LIMIT 5
        `;
        accessories.forEach(a => {
            console.log(`  ID: ${a.id}, Name: ${a.name}, Price: ${a.price}, CostPrice: ${a.costPrice || 'NULL'}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkAccessoryTable();
