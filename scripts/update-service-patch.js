const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'services', 'route.ts');
let content = fs.readFileSync(apiPath, 'utf8');

// Add costPrice to PATCH method destructuring
content = content.replace(
    /const { id, name, description, price, category, duration, image, features, isActive } = data;/,
    'const { id, name, description, price, category, duration, image, features, isActive, costPrice } = data;'
);

// Add costPrice to PATCH UPDATE SET
content = content.replace(
    /SET\s+name = COALESCE\(\${name}, name\),/,
    `SET
        name = COALESCE(\${name}, name),
        description = COALESCE(\${description}, description),
        price = COALESCE(\${price}, price),
        category = COALESCE(\${category}, category),
        duration = COALESCE(\${duration}, duration),
        image = COALESCE(\${image}, image),
        features = COALESCE(\${features}, features),
        "isActive" = COALESCE(\${isActive}, "isActive"),
        "costPrice" = COALESCE(\${costPrice}, "costPrice"),`
);

fs.writeFileSync(apiPath, content, 'utf8');
console.log('✅ Updated Service API PATCH with costPrice');
