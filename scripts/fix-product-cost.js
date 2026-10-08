const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'analytics', 'revenue-sales', 'route.ts');
let content = fs.readFileSync(apiPath, 'utf8');

// Find where productMap is built and ensure cost is included
const productMapSection = content.match(/\/\/ Track product revenue for top products[\s\S]*?productMap\[productName\]\.profit \+= totalProfit;/);
if (productMapSection) {
    console.log('📦 Product map section found');
    console.log(productMapSection[0]);
} else {
    console.log('❌ Product map section not found');
}

// Let me completely rewrite the product tracking part
const newProductTracking = `
        // Track product revenue for top products
        const productName = item.name || item.title || item.product_name || item.productName || 'Unknown Product';
        if (!productMap[productName]) {
          productMap[productName] = { 
            title: productName, 
            quantity: 0, 
            revenue: 0, 
            cost: 0, 
            profit: 0 
          };
        }
        productMap[productName].quantity += quantity;
        productMap[productName].revenue += totalRevenue;
        productMap[productName].cost += totalCost;
        productMap[productName].profit += totalProfit;
`;

// Replace the existing product tracking
content = content.replace(
    /\/\/ Track product revenue for top products[\s\S]*?productMap\[productName\]\.profit \+= result\.totalProfit;/,
    newProductTracking
);

fs.writeFileSync(apiPath, content, 'utf8');
console.log('✅ Fixed product cost calculation in API');
