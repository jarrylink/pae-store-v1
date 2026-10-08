const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkOrderStatuses() {
    try {
        console.log('\\n📊 CHECKING ORDER STATUSES\\n');
        console.log('='.repeat(50));
        
        // Get all unique statuses
        const statuses = await sql
            SELECT DISTINCT status, COUNT(*) as count
            FROM "Order"
            GROUP BY status
            ORDER BY status
        ;
        
        console.log('\\n📋 Order Statuses Found:');
        statuses.forEach(s => {
            console.log(  - "":  orders);
        });
        
        // Check confirmed orders specifically
        const confirmedOrders = await sql
            SELECT id, "orderNumber", status, "paymentStatus"
            FROM "Order"
            WHERE status ILIKE '%confirm%' 
               OR status ILIKE '%paid%'
               OR status = 'confirmed'
            LIMIT 5
        ;
        
        if (confirmedOrders.length > 0) {
            console.log('\\n✅ Confirmed/Paid Orders:');
            confirmedOrders.forEach(o => {
                console.log(  - Order #: status="", payment="");
            });
        } else {
            console.log('\\n⚠️ No confirmed orders found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkOrderStatuses();
