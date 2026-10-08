const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('\n=== CHECKING ORDER #19 ITEMS ===');
  const order = await sql`
    SELECT id, items FROM "Order" WHERE id = 19
  `;
  console.log('Order items:', JSON.stringify(order[0].items, null, 2));

  console.log('\n=== CHECKING INSTALLATION MATERIAL ITEMS ===');
  const materialItems = await sql`
    SELECT * FROM "InstallationMaterialItem" WHERE "serviceId" = 7
  `;
  console.log('Material items for service 7:', JSON.stringify(materialItems, null, 2));

  console.log('\n=== CHECKING SERVICE 7 ===');
  const service = await sql`
    SELECT id, name, category FROM "Service" WHERE id = 7
  `;
  console.log('Service 7:', JSON.stringify(service, null, 2));

  process.exit();
}
check().catch(console.error);
