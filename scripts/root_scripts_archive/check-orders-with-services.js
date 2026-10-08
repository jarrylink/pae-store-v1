const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('\n?? ORDERS WITH SERVICES\n');
  
  const orders = await sql`
    SELECT id, "orderNumber", status, items 
    FROM "Order" 
    WHERE items @> '[{"type": "service"}]'
    LIMIT 10
  `;
  
  console.log('Orders with service items:', orders.length);
  if (orders.length > 0) {
    orders.forEach(o => {
      console.log('  - Order #' + o.id + ' (' + o.status + ')');
    });
  } else {
    console.log('  No orders with services found yet.');
  }
  
  process.exit();
}
check().catch(err => { console.error(err); process.exit(1); });
