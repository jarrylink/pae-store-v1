const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function cleanProductData() {
    try {
        console.log('🔧 Cleaning product data from database...\n');
        
        // Get all products
        const products = await sql
            SELECT id, title, brand, spec FROM "Product"
        ;
        
        console.log(📦 Found  products);
        
        let cleaned = 0;
        for (const p of products) {
            // Use the actual Unicode replacements
            let cleanTitle = p.title;
            let cleanBrand = p.brand;
            let cleanSpec = p.spec;
            
            // Replace specific bad character sequences
            if (cleanTitle) {
                cleanTitle = cleanTitle
                    .replace(/\u00c3\u00a2\u00e2\u0082\u00ac\u00c3\u201a\u00c2\u00a2/g, '')
                    .replace(/\u00c3\u00a2/g, '')
                    .replace(/\u00e2\u0082\u00ac/g, '')
                    .replace(/\u00c3\u201a\u00c2\u00a2/g, '')
                    .replace(/\u00e2\u0080\u009a\u00c2\u00a2/g, '')
                    .replace(/[^\w\s\-.]/g, ' ')
                    .trim();
            }
            
            if (cleanBrand) {
                cleanBrand = cleanBrand
                    .replace(/\u00c3\u00a2\u00e2\u0082\u00ac\u00c3\u201a\u00c2\u00a2/g, '')
                    .replace(/\u00c3\u00a2/g, '')
                    .replace(/\u00e2\u0082\u00ac/g, '')
                    .replace(/\u00c3\u201a\u00c2\u00a2/g, '')
                    .replace(/\u00e2\u0080\u009a\u00c2\u00a2/g, '')
                    .replace(/[^\w\s\-.]/g, ' ')
                    .trim();
            }
            
            if (cleanSpec) {
                cleanSpec = cleanSpec
                    .replace(/\u00c3\u00a2\u00e2\u0082\u00ac\u00c3\u201a\u00c2\u00a2/g, '')
                    .replace(/\u00c3\u00a2/g, '')
                    .replace(/\u00e2\u0082\u00ac/g, '')
                    .replace(/\u00c3\u201a\u00c2\u00a2/g, '')
                    .replace(/\u00e2\u0080\u009a\u00c2\u00a2/g, '')
                    .replace(/[^\w\s\-.]/g, ' ')
                    .trim();
            }
            
            if (cleanTitle !== p.title || cleanBrand !== p.brand || cleanSpec !== p.spec) {
                await sql
                    UPDATE "Product" 
                    SET 
                        title = ,
                        brand = ,
                        spec = 
                    WHERE id = 
                ;
                cleaned++;
                console.log(  ✅ Fixed product : "");
            }
        }
        
        console.log(\n✅ Cleaned  products!);
        
        // Verify the cleanup
        const verify = await sql
            SELECT id, title, brand, spec FROM "Product" LIMIT 5
        ;
        console.log('\n📊 Sample of cleaned products:');
        verify.forEach(p => {
            console.log(  :  -  - );
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

cleanProductData();
