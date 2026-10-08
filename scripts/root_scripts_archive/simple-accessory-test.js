const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function test() {
  console.log('Testing Accessory table...');
  
  try {
    // Simple query
    const result = await sql`SELECT COUNT(*) as count FROM "Accessory"`;
    console.log('Accessories found:', result[0].count);
    
    const all = await sql`SELECT * FROM "Accessory" LIMIT 5`;
    console.log('Sample:', all);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit();
}

test();