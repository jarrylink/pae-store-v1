const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkTables() {
    console.log('\n📁 INSTALLER-RELATED TABLES:\n');
    
    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND (table_name ILIKE '%installer%' OR table_name ILIKE '%service%' OR table_name ILIKE '%staff%')
        ORDER BY table_name
    `;
    
    if (tables.length === 0) {
        console.log('No installer-related tables found. Will create necessary structure.');
    } else {
        tables.forEach(t => console.log(`  • ${t.table_name}`));
    }
    
    // Check Installer table if exists
    const installerExists = await sql`
        SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Installer')
    `;
    
    if (installerExists[0].exists) {
        const installers = await sql`
            SELECT * FROM "Installer" LIMIT 5
        `;
        console.log('\n📊 Sample installers:', installers);
    }
}

checkTables();
