const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'services', 'route.ts');
let content = fs.readFileSync(apiPath, 'utf8');

// Update SELECT to include costPrice
content = content.replace(
    /SELECT \* FROM "Service"/g,
    'SELECT *, "costPrice" FROM "Service"'
);

fs.writeFileSync(apiPath, content, 'utf8');
console.log('✅ Updated Service GET with costPrice');
