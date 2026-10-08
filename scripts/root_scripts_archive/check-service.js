const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkService() {
    console.log('\n📋 SERVICE TABLE STRUCTURE:\n');
    
    // Get columns
    const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Service'
        ORDER BY ordinal_position
    `;
    
    columns.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type}`);
    });
    
    // Get service data
    const services = await sql`
        SELECT * FROM "Service" ORDER BY id
    `;
    
    console.log('\n📊 SERVICE DATA:\n');
    services.forEach(service => {
        console.log(`  ID ${service.id}: ${service.name}`);
        console.log(`    Price: ₦${service.price}`);
        console.log(`    Category: ${service.category}`);
        console.log(`    Duration: ${service.duration}`);
        console.log(`    Active: ${service.isactive}`);
        console.log('---');
    });
    
    // Get service orders
    const serviceOrders = await sql`
        SELECT 
            s.name as service_name,
            COUNT(o.id) as orders_count,
            SUM(o.total) as total_revenue
        FROM "Service" s
        LEFT JOIN "Order" o ON o."serviceId" = s.id AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
        GROUP BY s.id, s.name
        ORDER BY total_revenue DESC
    `;
    
    console.log('\n💰 SERVICE REVENUE:\n');
    serviceOrders.forEach(so => {
        console.log(`  ${so.service_name}: ${so.orders_count || 0} orders, ₦${Number(so.total_revenue || 0).toLocaleString()}`);
    });
}

checkService();
