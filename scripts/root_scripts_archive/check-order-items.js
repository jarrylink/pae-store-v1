const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('\n=== CHECKING ORDER #19 ITEMS ===');
  const order = await sql`
    SELECT id, items FROM "Order" WHERE id = 19
  `;
  console.log('Order items:', JSON.stringify(order[0].items, null, 2));

  console.log('\n=== CHECKING INSTALLATION MATERIAL ITEMS FOR SERVICE 8 ===');
  const materialItems = await sql`
    SELECT * FROM "InstallationMaterialItem" WHERE "serviceId" = 8
  `;
  console.log('Material items for service 8:', JSON.stringify(materialItems, null, 2));

  console.log('\n=== CHECKING SERVICE 8 ===');
  const service = await sql`
    SELECT id, name, category, features FROM "Service" WHERE id = 8
  `;
  console.log('Service 8:', JSON.stringify(service, null, 2));

  console.log('\n=== CHECKING ALL INSTALLATION MATERIAL SERVICES ===');
  const allMaterials = await sql`
    SELECT id, name, category FROM "Service" WHERE category = 'installation material'
  `;
  console.log('All installation material services:', JSON.stringify(allMaterials, null, 2));

  process.exit();
}
check().catch(console.error);
