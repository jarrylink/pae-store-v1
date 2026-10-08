const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'analytics', 'revenue-sales', 'route.ts');
const content = fs.readFileSync(apiPath, 'utf8');

// Find the cost mapping section
const costMapping = content.match(/\/\/ Find cost price based on product ID[\s\S]*?category = 'products';/);
if (costMapping) {
    console.log('📊 COST MAPPING LOGIC:\n');
    console.log(costMapping[0]);
} else {
    console.log('❌ Cost mapping section not found');
}

// Find the product cost map creation
const productMap = content.match(/const productCostMap[\s\S]*?\};/);
if (productMap) {
    console.log('\n📦 PRODUCT COST MAP:\n');
    console.log(productMap[0]);
}
