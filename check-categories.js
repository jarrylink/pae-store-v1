const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkCategories() {
  try {
    console.log('🔍 CHECKING PRODUCT CATEGORIES');
    console.log('==============================');
    
    // Get all products with their categories
    const products = await sql`
      SELECT id, title, category FROM "Product" ORDER BY category
    `;
    
    console.log(`\n📊 Total products: ${products.length}`);
    console.log('\n📦 Products by category:');
    
    const categoryCount: Record<string, number> = {};
    products.forEach(p => {
      const cat = p.category || 'uncategorized';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} products`);
    });
    
    console.log('\n📋 All products with their categories:');
    products.forEach(p => {
      console.log(`  ID: ${p.id} | Category: "${p.category || 'NULL'}" | Title: ${p.title}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCategories();
