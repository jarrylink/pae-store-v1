const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'analytics', 'revenue-sales', 'route.ts');
const content = fs.readFileSync(apiPath, 'utf8');

// Show the cost fetching section
console.log('📊 COST FETCHING SECTION:\n');
const costFetchSection = content.match(/\/\/ Get all products with their cost prices[\s\S]*?\/\/ Create lookup maps/);
if (costFetchSection) {
    console.log(costFetchSection[0]);
} else {
    console.log('❌ Could not find cost fetching section');
}

console.log('\n📊 PRODUCT COST MAP SECTION:\n');
const productMapSection = content.match(/const productCostMap[\s\S]*?;/);
if (productMapSection) {
    console.log(productMapSection[0]);
}
