const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkServiceTable() {
    try {
        console.log('🔧 SERVICE TABLE STRUCTURE:\n');
        
        const columns = await sql`
            SELECT 
                column_name, 
                data_type, 
                is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'Service'
            ORDER BY ordinal_position
        `;
        
        console.log('Columns in Service table:');
        columns.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL';
            console.log(`  - ${col.column_name}: ${col.data_type} (${nullable})`);
        });
        
        // Check if costPrice column exists
        const hasCostPrice = columns.some(c => c.column_name === 'costPrice' || c.column_name === 'cost_price');
        console.log(`\n✅ Has costPrice column: ${hasCostPrice ? 'YES' : 'NO'}`);
        
        // Show sample data with costPrice
        console.log('\n📦 Sample service data:');
        const services = await sql`
            SELECT id, name, price, "costPrice" 
            FROM "Service" 
            LIMIT 5
        `;
        services.forEach(s => {
            console.log(`  ID: ${s.id}, Name: ${s.name}, Price: ${s.price}, CostPrice: ${s.costPrice || 'NULL'}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkServiceTable();
