const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'analytics', 'revenue-sales', 'route.ts');
let content = fs.readFileSync(apiPath, 'utf8');

// Add debug logging after cost maps are created
content = content.replace(
    /\/\/ Create lookup maps for cost prices/,
    `// Create lookup maps for cost prices
    console.log('📊 Products with costs:', products.length);
    console.log('📊 Services with costs:', services.length);
    console.log('📊 Accessories with costs:', accessories.length);
    
    // Log first few product costs for debugging
    console.log('📊 Sample product costs:');
    products.slice(0, 3).forEach((p: any) => {
      console.log(\`  \${p.id}: \${p.title} - Cost: \${p.costPrice}\`);
    });`
);

// Add debug in the item processing
content = content.replace(
    /\/\/ Process each item in the order/,
    `// Process each item in the order
        console.log('📦 Processing order items:', orderItems.length);`
);

// Add debug when finding cost
content = content.replace(
    /\/\/ Find cost price based on product ID/,
    `// Find cost price based on product ID
        console.log(\`  Item: \${item.title || item.name}, productId: \${item.productId}\`);`
);

fs.writeFileSync(apiPath, content, 'utf8');
console.log('✅ Added debug logging to Revenue API');
