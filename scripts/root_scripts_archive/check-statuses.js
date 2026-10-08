const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('\n?? ORDER STATUS CHECK\n');
  
  const statuses = await sql`SELECT DISTINCT status FROM "Order" ORDER BY status`;
  console.log('Order Statuses in DB:');
  statuses.forEach(s => console.log('  -', s.status));
  
  const counts = await sql`SELECT status, COUNT(*) as count FROM "Order" GROUP BY status ORDER BY status`;
  console.log('\nOrder Counts by Status:');
  counts.forEach(c => console.log('  -', c.status + ':', c.count));
  
  process.exit();
}
check().catch(err => { console.error(err); process.exit(1); });
