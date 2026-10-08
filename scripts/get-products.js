const { neon } = require('@neondatabase/serverless');

// Hardcode the database URL from your .env.local
const DATABASE_URL = 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

async function getProducts() {
    try {
        console.log('\\n📦 FETCHING PRODUCTS\\n');
        
        const products = await sqlSELECT * FROM "Product" ORDER BY id;
        
        console.log(✅ Found  products\\n);
        
        if (products.length > 0) {
            // Show columns
            const columns = Object.keys(products[0]);
            console.log('📋 Columns:', columns.join(', '));
            console.log('\\n📊 Data:\\n');
            
            products.forEach(p => {
                console.log(ID:  |  | ₦ | Stock: );
            });
        }
        
        // Get column info
        const columns = await sql
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Product' 
            ORDER BY ordinal_position
        ;
        
        console.log('\\n📋 FULL COLUMN LIST:');
        columns.forEach(c => console.log(  - : ));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

getProducts();
