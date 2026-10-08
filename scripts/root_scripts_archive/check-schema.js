const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  const schema = await sql`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_name = 'Order' AND column_name = 'items'
  `;
  console.log('Items column info:', JSON.stringify(schema, null, 2));
  process.exit();
}
check().catch(console.error);
