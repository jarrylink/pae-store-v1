const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

if (!DATABASE_URL) {
    console.error('? DATABASE_URL not found');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function analyzeDatabase() {
    try {
        // Get all tables
        const tables = await sql(\
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        \);
        
        console.log('?? TABLES FOUND:');
        tables.forEach(t => console.log('  - ' + t.table_name));
        
        // For each table, get its columns
        for (const table of tables) {
            const columns = await sql(\
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = '\'
                ORDER BY ordinal_position
            \);
            
            console.log(\\n?? \ COLUMNS:\);
            columns.forEach(c => {
                console.log(\  - \: \ \\);
            });
        }
        
        // Check if Accessory table exists and get its data
        const accessoryExists = tables.some(t => t.table_name === 'Accessory');
        if (accessoryExists) {
            const count = await sql('SELECT COUNT(*) as total FROM "Accessory"');
            console.log(\\n?? Total Accessories: \\);
            
            if (count[0].total > 0) {
                const sample = await sql('SELECT * FROM "Accessory" LIMIT 5');
                console.log('\n?? SAMPLE ACCESSORIES:');
                sample.forEach(a => {
                    console.log(\  - ID: \, Name: \, Price: \, Stock: \\);
                });
            }
        }
        
    } catch (error) {
        console.error('? Error:', error.message);
    }
}

analyzeDatabase();
