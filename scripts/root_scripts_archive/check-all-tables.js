const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkAllTables() {
    console.log('\n📋 ALL TABLES IN DATABASE:\n');
    
    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    `;
    
    tables.forEach(t => {
        console.log(`  • ${t.table_name}`);
    });
    
    // Check each important table's structure
    const importantTables = ['Order', 'Product', 'User', 'Vendor', 'Installer', 'Category', 'Service'];
    
    for (const table of importantTables) {
        const exists = tables.some(t => t.table_name === table);
        if (exists) {
            console.log(`\n📊 ${table} TABLE COLUMNS:`);
            const columns = await sql`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = '${sql.raw(table)}'
                ORDER BY ordinal_position
            `;
            columns.slice(0, 15).forEach(col => {
                console.log(`  • ${col.column_name}: ${col.data_type}`);
            });
            if (columns.length > 15) {
                console.log(`  ... and ${columns.length - 15} more columns`);
            }
        } else {
            console.log(`\n❌ ${table} table not found`);
        }
    }
}

checkAllTables();
