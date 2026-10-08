const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('\n?? ORDER ITEMS STRUCTURE\n');
  
  const orders = await sql`SELECT id, "orderNumber", status, items FROM "Order" LIMIT 3`;
  
  orders.forEach(o => {
    console.log('\nOrder #' + o.id + ' (' + o.status + ')');
    console.log('  Order Number:', o.orderNumber);
    console.log('  Items:', JSON.stringify(o.items, null, 2));
    console.log('  ---');
  });
  
  process.exit();
}
check().catch(err => { console.error(err); process.exit(1); });
