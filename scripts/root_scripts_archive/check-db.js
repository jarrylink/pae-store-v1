const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('\n=== CHECKING ORDER #19 ===');
  const order = await sql`
    SELECT id, items, total, subtotal, "hasService", "serviceId", "serviceName", "servicePrice"
    FROM "Order"
    WHERE id = 19
  `;
  console.log('Order #19:', JSON.stringify(order, null, 2));

  console.log('\n=== CHECKING INSTALLATION MATERIALS ===');
  const materials = await sql`
    SELECT id, name, category, price, features, "isActive"
    FROM "Service"
    WHERE category = 'installation material' OR category = 'installation'
  `;
  console.log('Installation Materials:', JSON.stringify(materials, null, 2));

  console.log('\n=== CHECKING ALL SERVICES ===');
  const allServices = await sql`
    SELECT id, name, category, price
    FROM "Service"
    LIMIT 10
  `;
  console.log('All Services:', JSON.stringify(allServices, null, 2));

  process.exit();
}
check().catch(err => { console.error(err); process.exit(1); });
