const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkTables() {
    console.log('🔍 Checking Database Tables\n');
    console.log('='.repeat(50) + '\n');

    try {
        // Get all tables
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;
        
        console.log('📊 TABLES FOUND:');
        tables.forEach(t => {
            console.log(`   - ${t.table_name}`);
        });

        // Specifically check for OrderAccessory
        const orderAccessoryExists = tables.some(t => t.table_name === 'OrderAccessory');
        
        console.log(`\n📋 OrderAccessory table exists: ${orderAccessoryExists ? '✅ YES' : '❌ NO'}`);

        if (orderAccessoryExists) {
            // Get columns
            const columns = await sql`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'OrderAccessory'
                ORDER BY ordinal_position
            `;
            
            console.log('\n📋 OrderAccessory columns:');
            columns.forEach(c => {
                console.log(`   - ${c.column_name}: ${c.data_type} (${c.is_nullable === 'YES' ? 'nullable' : 'required'})`);
            });

            // Get count
            const count = await sql`SELECT COUNT(*) as total FROM "OrderAccessory"`;
            console.log(`\n📊 Total OrderAccessory records: ${count[0].total}`);
        } else {
            console.log('\n⚠️ OrderAccessory table does NOT exist!');
            console.log('📋 Please run: scripts/create_order_accessory_table.sql in Neon console');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkTables();