const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function verifyDB() {
    console.log('\n🔍 DATABASE VERIFICATION:\n');
    
    // Check total revenue from database
    const revenue = await sql`
        SELECT 
            SUM(total) as total_revenue,
            COUNT(*) as total_orders
        FROM "Order"
        WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
    `;
    console.log(`Database Revenue: ₦${Number(revenue[0].total_revenue).toLocaleString()}`);
    console.log(`Database Orders: ${revenue[0].total_orders}`);
    
    // Check pending pipeline
    const pipeline = await sql`
        SELECT 
            SUM(total) as pipeline_value,
            COUNT(*) as pipeline_orders
        FROM "Order"
        WHERE status = 'pending'
    `;
    console.log(`\nPipeline Value: ₦${Number(pipeline[0].pipeline_value).toLocaleString()}`);
    console.log(`Pipeline Orders: ${pipeline[0].pipeline_orders}`);
    
    // Check product sales
    const products = await sql`
        SELECT 
            p.title,
            COUNT(*) as sold
        FROM "Order" o,
        jsonb_array_elements(o.items) as items
        JOIN "Product" p ON p.id = CAST(items->>'productId' AS INTEGER)
        WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
        GROUP BY p.title
        ORDER BY sold DESC
        LIMIT 5
    `;
    console.log(`\nTop Products by Units Sold:`);
    products.forEach(p => {
        console.log(`  ${p.title}: ${p.sold} units`);
    });
}

verifyDB();
