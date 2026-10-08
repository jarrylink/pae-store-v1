const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function examine() {
    console.log('\n🔍 EXAMINING ORDER TABLE STRUCTURE\n');
    console.log('='.repeat(60));
    
    try {
        // Get all columns in Order table
        const columns = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'Order'
            ORDER BY ordinal_position
        `;
        
        console.log('\n📋 ORDER TABLE COLUMNS:');
        columns.forEach(col => {
            console.log(`  • ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
        });
        
        // Get sample data to understand what's stored
        const sample = await sql`
            SELECT * FROM "Order" LIMIT 3
        `;
        
        console.log('\n📊 SAMPLE ORDER DATA:');
        sample.forEach((order, idx) => {
            console.log(`\n  Order ${idx + 1}:`);
            Object.keys(order).forEach(key => {
                const value = order[key];
                if (value && typeof value === 'object') {
                    console.log(`    ${key}: ${JSON.stringify(value).substring(0, 100)}...`);
                } else {
                    console.log(`    ${key}: ${value}`);
                }
            });
        });
        
        // Check what status-like field exists
        const statusFields = await sql`
            SELECT column_name 
            FROM information_schema.columns
            WHERE table_name = 'Order' 
            AND (column_name ILIKE '%status%' OR column_name ILIKE '%state%')
        `;
        
        console.log('\n🔍 STATUS/STATE RELATED FIELDS:');
        statusFields.forEach(f => {
            console.log(`  • ${f.column_name}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

examine();
