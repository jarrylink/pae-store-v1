const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'analytics', 'revenue-sales', 'route.ts');
let content = fs.readFileSync(apiPath, 'utf8');

// Fix the product cost mapping - use correct column name
content = content.replace(
    /SELECT id, title, price, "purchasePrice" as costPrice FROM "Product"/g,
    'SELECT id, title, price, "purchasePrice" as costPrice FROM "Product"'
);

// Ensure the cost mapping uses the correct field
content = content.replace(
    /productCostMap\[p.id\] = Number\(p\.costPrice\) \|\| 0;/g,
    'productCostMap[p.id] = Number(p.costPrice) || 0;'
);

// Add debug logging to see what's happening
content = content.replace(
    /\/\/ Create lookup maps for cost prices/,
    '// Create lookup maps for cost prices\n        console.log("📊 Products with costs:", products.length);\n        console.log("📊 Services with costs:", services.length);\n        console.log("📊 Accessories with costs:", accessories.length);'
);

fs.writeFileSync(apiPath, content, 'utf8');
console.log('✅ Updated Revenue API with debug logging');
