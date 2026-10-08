async function checkAPIData() {
    try {
        console.log('📊 CHECKING API RESPONSE DATA:\n');
        const response = await fetch('http://localhost:3000/api/admin/analytics/revenue-sales?range=30d');
        const data = await response.json();
        
        // Check if cost data is in the response
        console.log('✅ API Response Keys:', Object.keys(data));
        console.log('\n📦 Products with costs:');
        console.log(JSON.stringify(data.products, null, 2));
        
        console.log('\n📊 Revenue Categories:');
        console.log(JSON.stringify(data.revenueCategories, null, 2));
        
        console.log('\n📊 Pipeline Categories:');
        console.log(JSON.stringify(data.pipelineCategories, null, 2));
        
        console.log('\n📊 Metrics:');
        console.log(JSON.stringify(data.metrics, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkAPIData();
