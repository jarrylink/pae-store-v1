const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkTable() {
    try {
        const result = await sql
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'OrderAccessory'
            ) as exists
        ;
        console.log('OrderAccessory table exists:', result[0].exists);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkTable();
