const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('\n?? AVAILABLE SERVICES (INSTALLATION MATERIALS)\n');
  
  const services = await sql`SELECT id, name, category, price, "isActive" FROM "Service" WHERE "isActive" = true ORDER BY name`;
  
  services.forEach(s => {
    console.log('  ID:', s.id);
    console.log('  Name:', s.name);
    console.log('  Price: ?' + Number(s.price).toLocaleString());
    console.log('  Category:', s.category || 'Uncategorized');
    console.log('  ---');
  });
  
  console.log('\nTotal:', services.length, 'services found\n');
  process.exit();
}
check().catch(err => { console.error(err); process.exit(1); });
