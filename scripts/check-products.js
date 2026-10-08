const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkProducts() {
    try {
        console.log('\n?? CHECKING PRODUCTS TABLE\n');
        console.log('=' .repeat(50));
        
        // Check if Product table exists
        const tables = await sql
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        ;
        
        console.log('\n?? All tables in database:');
        tables.forEach(t => console.log(  - ));
        
        // Check Product table structure
        const productExists = tables.some(t => t.table_name === 'Product');
        
        if (productExists) {
            console.log('\n? Product table exists!');
            
            // Get column info
            const columns = await sql
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'Product'
                ORDER BY ordinal_position
            ;
            
            console.log('\n?? Product table columns:');
            columns.forEach(c => {
                console.log(  -  :  );
            });
            
            // Get sample data
            const products = await sql
                SELECT * FROM "Product" LIMIT 5
            ;
            
            console.log(\n?? Sample products ():);
            products.forEach(p => {
                console.log(  - ID: , Title: , Price: , Inventory: );
            });
            
            // Get counts
            const count = await sql
                SELECT COUNT(*) as total FROM "Product"
            ;
            console.log(\n?? Total products: );
            
        } else {
            console.log('\n? Product table does NOT exist!');
            console.log('\n?? Checking for product data in Orders...');
            
            // Check for products in Order items
            const orders = await sql
                SELECT items FROM "Order" WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
            ;
            
            const productNames = new Set();
            orders.forEach(order => {
                let items = order.items;
                if (typeof items === 'string') {
                    try {
                        items = JSON.parse(items);
                    } catch(e) {}
                }
                if (Array.isArray(items)) {
                    items.forEach(item => {
                        if (item.name || item.title) {
                            productNames.add(item.name || item.title);
                        }
                    });
                }
            });
            
            console.log('\n?? Product names found in orders:');
            productNames.forEach(name => {
                console.log(  - );
            });
        }
        
    } catch (error) {
        console.error('? Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

checkProducts();
