const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkCategories() {
  console.log('\n📊 CATEGORY TABLE CONTENT\n');
  
  try {
    // Get all categories
    const categories = await sql`
      SELECT id, name, slug, description, icon, image, "isActive", "createdAt"
      FROM "Category"
      ORDER BY id
    `;
    
    console.log(`Found ${categories.length} categories in database:\n`);
    
    categories.forEach(cat => {
      console.log(`ID: ${cat.id}`);
      console.log(`  Name: ${cat.name}`);
      console.log(`  Slug: ${cat.slug}`);
      console.log(`  Description: ${cat.description || 'NULL'}`);
      console.log(`  Icon: ${cat.icon || 'NULL'}`);
      console.log(`  Image: ${cat.image || 'NULL'}`);
      console.log(`  isActive: ${cat.isActive}`);
      console.log(`  CreatedAt: ${cat.createdAt}`);
      console.log('---');
    });
    
    // Check what fields exist in the Category table
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Category'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 CATEGORY TABLE COLUMNS:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCategories();
