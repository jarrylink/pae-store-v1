const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
    try {
        const result = await sql
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Service'
            ORDER BY ordinal_position
        ;
        console.log('Service table columns:');
        result.forEach(col => {
            console.log(  - : );
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkSchema();
