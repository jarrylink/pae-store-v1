const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkOrderRevenue() {
    try {
        // Order counts by status
        const orderStatus = await sql`
            SELECT status, COUNT(*) as count 
            FROM "Order" 
            GROUP BY status
        `;
        
        console.log('📊 Orders by Status:');
        console.table(orderStatus);
        
        // Revenue calculations
        const revenue = await sql`
            SELECT 
                SUM(total) as total_revenue,
                SUM(CASE WHEN "hasService" = true THEN "servicePrice" ELSE 0 END) as service_revenue,
                SUM(CASE WHEN "hasService" = false OR "serviceId" IS NULL THEN total ELSE 0 END) as product_revenue
            FROM "Order"
            WHERE status IN ('confirmed', 'shipped', 'delivered')
        `;
        
        console.log('\n💰 Revenue Summary:');
        console.log(`Total Revenue: ₦${revenue[0].total_revenue || 0}`);
        console.log(`Product Revenue: ₦${revenue[0].product_revenue || 0}`);
        console.log(`Service Revenue: ₦${revenue[0].service_revenue || 0}`);
        
        // Paid vs Unpaid orders
        const paymentStatus = await sql`
            SELECT 
                COUNT(CASE WHEN "paymentStatus" = 'paid' THEN 1 END) as paid_orders,
                COUNT(CASE WHEN "paymentStatus" = 'pending' THEN 1 END) as unpaid_orders,
                COUNT(CASE WHEN "paymentStatus" = 'failed' THEN 1 END) as failed_orders
            FROM "Order"
        `;
        
        console.log('\n💳 Payment Status:');
        console.log(`Paid Orders: ${paymentStatus[0].paid_orders || 0}`);
        console.log(`Unpaid Orders: ${paymentStatus[0].unpaid_orders || 0}`);
        console.log(`Failed Orders: ${paymentStatus[0].failed_orders || 0}`);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

checkOrderRevenue();
