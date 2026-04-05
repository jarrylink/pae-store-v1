const fetch = require('node-fetch');

async function testAPI() {
    console.log('🔍 Testing Orders API...\n');
    
    // Test with a real userId
    const userId = 'user-1773229531941-tw4gnzz';
    
    try {
        const response = await fetch(`http://localhost:3000/api/orders?userId=${userId}`);
        const text = await response.text();
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.get('content-type'));
        console.log('First 200 chars of response:', text.substring(0, 200));
        
        // Try to parse as JSON
        try {
            const data = JSON.parse(text);
            console.log('\n✅ Valid JSON response');
            console.log('Orders count:', Array.isArray(data) ? data.length : 'Not an array');
            if (Array.isArray(data) && data.length > 0) {
                console.log('First order:', JSON.stringify(data[0], null, 2).substring(0, 500));
            }
        } catch (e) {
            console.log('\n❌ Not valid JSON - likely HTML error page');
        }
    } catch (error) {
        console.error('Request failed:', error);
    }
}

testAPI();
