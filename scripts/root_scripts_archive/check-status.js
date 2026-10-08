const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkStatus() {
    console.log('\n🔍 CHECKING ORDER STATUS VALUES\n');
    console.log('='.repeat(60));
    
    // Get all unique status values
    const statuses = await sql`
        SELECT 
            status,
            COUNT(*) as count,
            SUM(total) as total_revenue
        FROM "Order"
        GROUP BY status
        ORDER BY count DESC
    `;
    
    console.log('\n📊 ORDER STATUS DISTRIBUTION:');
    statuses.forEach(s => {
        console.log(`   ${s.status}: ${s.count} orders, ₦${Number(s.total_revenue).toLocaleString()}`);
    });
    
    // Check if there are any completed orders
    const completed = await sql`
        SELECT COUNT(*) as completed_count
        FROM "Order"
        WHERE status = 'completed'
    `;
    
    console.log(`\n✅ Completed orders: ${completed[0].completed_count}`);
    
    if (completed[0].completed_count === 0) {
        console.log('\n⚠️ No completed orders found. Available statuses:');
        statuses.forEach(s => {
            console.log(`   - ${s.status}`);
        });
    }
}

checkStatus();
