const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('\n? APPROVED ORDERS CHECK\n');
  
  // Check if 'approved' status exists
  const approved = await sql`SELECT id, "orderNumber", status FROM "Order" WHERE status = 'approved'`;
  console.log('Orders with status "approved":', approved.length);
  if (approved.length > 0) {
    approved.forEach(o => console.log('  - Order #' + o.id + ' (' + o.orderNumber + ')'));
  }
  
  // Check what statuses are being used
  const all = await sql`SELECT DISTINCT status FROM "Order" ORDER BY status`;
  console.log('\nAll statuses in use:');
  all.forEach(s => console.log('  -', s.status));
  
  // Check orders that might be considered 'approved'
  const approvedLike = await sql`SELECT id, "orderNumber", status FROM "Order" WHERE status IN ('confirmed', 'completed', 'approved')`;
  console.log('\nApproved-like orders (confirmed, completed, approved):', approvedLike.length);
  if (approvedLike.length > 0) {
    approvedLike.forEach(o => console.log('  - Order #' + o.id + ' (' + o.status + ')'));
  }
  
  process.exit();
}
check().catch(err => { console.error(err); process.exit(1); });
