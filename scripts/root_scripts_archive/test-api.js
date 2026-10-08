const fetch = require('node-fetch');

async function testAPI() {
    console.log('🔍 Testing Accessories API...\n');
    
    try {
        // Test GET /api/accessories
        console.log('📡 Testing GET /api/accessories...');
        const response = await fetch('http://localhost:3000/api/accessories');
        const data = await response.json();
        
        if (Array.isArray(data)) {
            console.log(`✅ Found ${data.length} accessories via API`);
            if (data.length > 0) {
                console.log('\n📦 First 3 accessories:');
                data.slice(0, 3).forEach(a => {
                    console.log(`  - ${a.name}: ₦${a.price}`);
                });
            }
        } else {
            console.error('❌ API returned unexpected format:', data);
        }
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        console.log('\n💡 Make sure your dev server is running:');
        console.log('   npm run dev');
    }
}

testAPI();