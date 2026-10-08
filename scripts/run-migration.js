const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createTables() {
    try {
        const sqlContent = fs.readFileSync('scripts/create_accessories_table.sql', 'utf8');
        
        // Split SQL statements by semicolon and execute each
        const statements = sqlContent.split(';').filter(s => s.trim());
        
        for (const stmt of statements) {
            if (stmt.trim()) {
                console.log('Executing:', stmt.substring(0, 50) + '...');
                await sql(stmt);
            }
        }
        
        console.log('? Accessories table created successfully!');
        
        // Verify the table was created
        const result = await sqlSELECT COUNT(*) as count FROM "Accessory";
        console.log(?? Accessories in database: );
        
    } catch (error) {
        console.error('? Error:', error.message);
    }
}

createTables();
