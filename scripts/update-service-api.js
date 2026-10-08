const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'services', 'route.ts');
let content = fs.readFileSync(apiPath, 'utf8');

// Add costPrice to the POST method destructuring
content = content.replace(
    /const { name, description, price, category, duration, image, features, isActive } = data;/,
    'const { name, description, price, category, duration, image, features, isActive, costPrice } = data;'
);

// Add costPrice to the INSERT statement
content = content.replace(
    /INSERT INTO "Service" \(name, description, price, category, duration, image, features, "isActive", "createdAt", "updatedAt"\)/,
    'INSERT INTO "Service" (name, description, price, category, duration, image, features, "isActive", "costPrice", "createdAt", "updatedAt")'
);

// Add costPrice to VALUES
content = content.replace(
    /\) VALUES \( \${name}, \${description}, \${price}, \${category}, \${duration}, \${image}, \${features}, \${isActive}, NOW\(\), NOW\(\) \)/,
    'VALUES (${name}, ${description}, ${price}, ${category}, ${duration}, ${image}, ${features}, ${isActive}, ${costPrice || 0}, NOW(), NOW())'
);

fs.writeFileSync(apiPath, content, 'utf8');
console.log('✅ Updated Service API with costPrice');
