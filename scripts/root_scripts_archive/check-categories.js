const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('\n=== PRODUCT CATEGORIES IN DATABASE ===');
  const products = await sql`
    SELECT DISTINCT category FROM "Product"
  `;
  console.log('Product categories:', products.map(p => p.category));

  console.log('\n=== ALL PRODUCTS ===');
  const all = await sql`
    SELECT id, title, category FROM "Product" LIMIT 10
  `;
  console.log('Products:', JSON.stringify(all, null, 2));

  console.log('\n=== CATEGORIES FROM CATEGORY SERVICE ===');
  const categories = await sql`
    SELECT slug, name FROM "Category"
  `;
  console.log('Categories:', JSON.stringify(categories, null, 2));

  process.exit();
}
check().catch(console.error);
