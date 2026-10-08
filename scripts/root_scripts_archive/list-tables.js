const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function listTables() {
    console.log('\n📋 ALL TABLES IN DATABASE\n');
    console.log('='.repeat(60));
    
    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    `;
    
    tables.forEach(t => {
        console.log(`  • ${t.table_name}`);
    });
    
    // Check for order-related tables specifically
    console.log('\n🔍 ORDER-RELATED TABLES:');
    const orderTables = tables.filter(t => t.table_name.toLowerCase().includes('order'));
    orderTables.forEach(t => {
        console.log(`  • ${t.table_name}`);
    });
}

listTables();
