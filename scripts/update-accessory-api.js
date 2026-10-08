const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'accessories', 'route.ts');
let content = fs.readFileSync(apiPath, 'utf8');

// Add costPrice to the POST method destructuring
content = content.replace(
    /const { name, description, price, category, image, sku, unit, stock, isActive } = data;/,
    'const { name, description, price, category, image, sku, unit, stock, isActive, costPrice } = data;'
);

// Add costPrice to the INSERT statement
content = content.replace(
    /INSERT INTO "Accessory" \(name, description, price, category, image, sku, unit, stock, "isActive", "createdAt", "updatedAt"\)/,
    'INSERT INTO "Accessory" (name, description, price, category, image, sku, unit, stock, "isActive", "costPrice", "createdAt", "updatedAt")'
);

// Add costPrice to VALUES
content = content.replace(
    /\) VALUES \( \${name}, \${description}, \${price}, \${category}, \${image}, \${sku}, \${unit}, \${stock}, \${isActive}, NOW\(\), NOW\(\) \)/,
    'VALUES (${name}, ${description}, ${price}, ${category}, ${image}, ${sku}, ${unit}, ${stock}, ${isActive}, ${costPrice || 0}, NOW(), NOW())'
);

fs.writeFileSync(apiPath, content, 'utf8');
console.log('✅ Updated Accessory API with costPrice');
