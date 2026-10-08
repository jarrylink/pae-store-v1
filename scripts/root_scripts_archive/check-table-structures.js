const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('\n?? DATABASE TABLE STRUCTURES\n');
  
  // Check Order table columns
  console.log('=== Order Table ===');
  const orderColumns = await sql`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'Order' 
    ORDER BY ordinal_position
  `;
  orderColumns.forEach(col => {
    console.log('  -', col.column_name, ':', col.data_type, '(Nullable:', col.is_nullable + ')');
  });
  
  console.log('\n=== Service Table ===');
  const serviceColumns = await sql`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'Service' 
    ORDER BY ordinal_position
  `;
  serviceColumns.forEach(col => {
    console.log('  -', col.column_name, ':', col.data_type, '(Nullable:', col.is_nullable + ')');
  });
  
  console.log('\n=== Product Table ===');
  const productColumns = await sql`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'Product' 
    ORDER BY ordinal_position
  `;
  productColumns.forEach(col => {
    console.log('  -', col.column_name, ':', col.data_type, '(Nullable:', col.is_nullable + ')');
  });
  
  process.exit();
}
check().catch(err => { console.error(err); process.exit(1); });
