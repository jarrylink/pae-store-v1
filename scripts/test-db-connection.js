const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function main() {
  try {
    const res = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`;
    console.log('DB SUCCESS, tables:', res.map(t => t.table_name));
  } catch (err) {
    console.error('DB ERROR:', err.message);
  }
}

main();
