const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixProducts() {
    try {
        console.log('🔧 Fixing products...');
        
        const products = await sql`
            SELECT id, title, brand, spec FROM "Product"
        `;
        
        for (const p of products) {
            const cleanTitle = p.title.replace(/[^\w\s\-.]/g, '').trim();
            const cleanBrand = p.brand.replace(/[^\w\s\-.]/g, '').trim();
            const cleanSpec = p.spec.replace(/[^\w\s\-.]/g, '').trim();
            
            if (cleanTitle !== p.title || cleanBrand !== p.brand || cleanSpec !== p.spec) {
                await sql`
                    UPDATE "Product" 
                    SET title = ${cleanTitle}, brand = ${cleanBrand}, spec = ${cleanSpec}
                    WHERE id = ${p.id}
                `;
                console.log(`  ✅ Fixed product ${p.id}: ${p.title} -> ${cleanTitle}`);
            }
        }
        
        console.log('✅ All products fixed!');
    } catch (e) {
        console.error('Error:', e.message);
    }
}

fixProducts();
