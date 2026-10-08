const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function quickCheck() {
    try {
        // Check if Product table exists
        const result = await sql
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'Product'
            ) as exists
        ;
        
        console.log('Product table exists:', result[0].exists);
        
        if (result[0].exists) {
            // Get columns
            const columns = await sql
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'Product'
                ORDER BY ordinal_position
            ;
            console.log('\nColumns:');
            columns.forEach(c => console.log(  : ));
            
            // Get count
            const count = await sqlSELECT COUNT(*) as total FROM "Product";
            console.log(\nTotal products: );
            
            // Get sample
            const samples = await sqlSELECT * FROM "Product" LIMIT 3;
            console.log('\nSample products:');
            samples.forEach(p => console.log(  :  - ?));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

quickCheck();
