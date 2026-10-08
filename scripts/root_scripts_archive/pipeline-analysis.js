const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function analyzePipeline() {
    console.log('\n🔍 PIPELINE ANALYTICS\n');
    console.log('='.repeat(60));
    
    // Pipeline definition: Orders that will become revenue but haven't yet
    // In your case: 'pending' (ordered but not paid)
    // 'confirmed' is NOT pipeline - it's REVENUE (payment captured)
    
    const pipeline = await sql`
        SELECT 
            'PENDING (Awaiting Payment)' as stage,
            COUNT(*) as orders,
            COALESCE(SUM(total), 0) as value,
            'Payment not captured - at risk' as status
        FROM "Order"
        WHERE status = 'pending'
        
        UNION ALL
        
        SELECT 
            'CONFIRMED (Revenue)' as stage,
            COUNT(*) as orders,
            COALESCE(SUM(total), 0) as value,
            'Payment captured - recognized revenue' as status
        FROM "Order"
        WHERE status = 'confirmed'
        
        UNION ALL
        
        SELECT 
            'PROCESSING (Revenue)' as stage,
            COUNT(*) as orders,
            COALESCE(SUM(total), 0) as value,
            'Being fulfilled - revenue recognized' as status
        FROM "Order"
        WHERE status = 'processing'
        
        UNION ALL
        
        SELECT 
            'SHIPPED (Revenue)' as stage,
            COUNT(*) as orders,
            COALESCE(SUM(total), 0) as value,
            'In transit - revenue recognized' as status
        FROM "Order"
        WHERE status = 'shipped'
        
        UNION ALL
        
        SELECT 
            'DELIVERED (Complete)' as stage,
            COUNT(*) as orders,
            COALESCE(SUM(total), 0) as value,
            'Order complete - final stage' as status
        FROM "Order"
        WHERE status = 'delivered'
    `;
    
    console.log('\n📊 ORDER PIPELINE BREAKDOWN:\n');
    pipeline.forEach(p => {
        console.log(`${p.stage}:`);
        console.log(`   Orders: ${p.orders}`);
        console.log(`   Value: ₦${Number(p.value).toLocaleString()}`);
        console.log(`   Status: ${p.status}`);
        console.log('');
    });
    
    // Calculate pipeline health metrics
    const totals = await sql`
        SELECT 
            COALESCE(SUM(CASE WHEN status = 'pending' THEN total ELSE 0 END), 0) as pipeline_value,
            COALESCE(SUM(CASE WHEN status IN ('confirmed', 'processing', 'shipped', 'delivered') THEN total ELSE 0 END), 0) as recognized_revenue,
            COALESCE(SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END), 0) as completed_revenue
        FROM "Order"
    `;
    
    const pipelineValue = totals[0].pipeline_value;
    const recognizedRevenue = totals[0].recognized_revenue;
    const totalValue = pipelineValue + recognizedRevenue;
    
    console.log('\n📈 PIPELINE HEALTH METRICS:\n');
    console.log(`Total Pipeline Value (Pending Payment): ₦${Number(pipelineValue).toLocaleString()}`);
    console.log(`Recognized Revenue: ₦${Number(recognizedRevenue).toLocaleString()}`);
    console.log(`Total Order Value: ₦${Number(totalValue).toLocaleString()}`);
    console.log(`Pipeline Conversion Rate: ${totalValue > 0 ? ((recognizedRevenue / totalValue) * 100).toFixed(1) : 0}%`);
    
    // Warning if pipeline is too large
    if (pipelineValue > recognizedRevenue * 0.3) {
        console.log('\n⚠️ WARNING: Pipeline value is >30% of recognized revenue');
        console.log('   Review payment collection process for pending orders');
    }
}

analyzePipeline();
