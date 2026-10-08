const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'accessories', 'route.ts');
let content = fs.readFileSync(apiPath, 'utf8');

// Add costPrice to PATCH method destructuring
content = content.replace(
    /const { id, name, description, price, category, image, sku, unit, stock, isActive } = data;/,
    'const { id, name, description, price, category, image, sku, unit, stock, isActive, costPrice } = data;'
);

// Add costPrice to PATCH UPDATE SET
content = content.replace(
    /SET\s+name = COALESCE\(\${name}, name\),/,
    `SET
        name = COALESCE(\${name}, name),
        description = COALESCE(\${description}, description),
        price = COALESCE(\${price}, price),
        category = COALESCE(\${category}, category),
        image = COALESCE(\${image}, image),
        sku = COALESCE(\${sku}, sku),
        unit = COALESCE(\${unit}, unit),
        stock = COALESCE(\${stock}, stock),
        "isActive" = COALESCE(\${isActive}, "isActive"),
        "costPrice" = COALESCE(\${costPrice}, "costPrice"),`
);

fs.writeFileSync(apiPath, content, 'utf8');
console.log('✅ Updated Accessory API PATCH with costPrice');
