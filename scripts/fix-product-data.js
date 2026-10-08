const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixProductData() {
    try {
        console.log('🔧 Fixing product data...\n');
        
        // Get all products to see what needs fixing
        const products = await sql\
            SELECT id, title, brand, spec, price FROM "Product"
        \;
        
        console.log('📦 Found ' + products.length + ' products');
        
        // Update each product individually
        for (const p of products) {
            const cleanTitle = p.title
                .replace(/ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢/g, '•')
                .replace(/ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¦/g, '₦')
                .replace(/Ã¢â€šÂ¬/g, '')
                .replace(/Ã¢â‚¬Å¡/g, '')
                .replace(/ÃƒÂ¢/g, '')
                .replace(/Ã‚Â¢/g, '')
                .replace(/Ã¢â‚¬Â¢/g, '•')
                .replace(/Ã¢â€šÂ¦/g, '₦');
            
            const cleanBrand = p.brand
                .replace(/ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢/g, '•')
                .replace(/ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¦/g, '₦')
                .replace(/Ã¢â€šÂ¬/g, '')
                .replace(/Ã¢â‚¬Å¡/g, '')
                .replace(/ÃƒÂ¢/g, '')
                .replace(/Ã‚Â¢/g, '')
                .replace(/Ã¢â‚¬Â¢/g, '•')
                .replace(/Ã¢â€šÂ¦/g, '₦');
            
            const cleanSpec = p.spec
                .replace(/ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢/g, '•')
                .replace(/ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¦/g, '₦')
                .replace(/Ã¢â€šÂ¬/g, '')
                .replace(/Ã¢â‚¬Å¡/g, '')
                .replace(/ÃƒÂ¢/g, '')
                .replace(/Ã‚Â¢/g, '')
                .replace(/Ã¢â‚¬Â¢/g, '•')
                .replace(/Ã¢â€šÂ¦/g, '₦');
            
            if (cleanTitle !== p.title || cleanBrand !== p.brand || cleanSpec !== p.spec) {
                await sql\
                    UPDATE "Product" 
                    SET 
                        title = ,
                        brand = ,
                        spec = 
                    WHERE id = 
                \;
                console.log('  ✅ Fixed product ' + p.id + ': ' + p.title);
            }
        }
        
        console.log('\n✅ All product data fixed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixProductData();
