async function checkProductData() {
    try {
        console.log('📊 CHECKING PRODUCT DATA FROM API:\n');
        const response = await fetch('http://localhost:3000/api/admin/analytics/revenue-sales?range=30d');
        const data = await response.json();
        
        console.log('📦 Products data:');
        console.log(JSON.stringify(data.products, null, 2));
        
        // Also check the revenue categories
        console.log('\n📊 Revenue Categories:');
        console.log(JSON.stringify(data.revenueCategories, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkProductData();
