const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkTables() {
    console.log('?? Checking Installation Material Tables\n');
    
    try {
        // Check InstallationMaterialItem table
        const columns = await sql
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'InstallationMaterialItem'
            ORDER BY ordinal_position
        ;
        
        console.log('?? InstallationMaterialItem Table:');
        if (columns.length > 0) {
            columns.forEach(c => {
                console.log(   - :  ());
            });
        } else {
            console.log('   ? Table does not exist');
        }

        // Check if there's also an InstallationMaterial table
        const tables = await sql
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%Installation%'
        ;
        
        console.log('\n?? Installation-related tables:');
        tables.forEach(t => {
            console.log(   - );
        });

    } catch (error) {
        console.error('? Error:', error.message);
    }
}

checkTables();
