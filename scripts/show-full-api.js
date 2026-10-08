const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'analytics', 'revenue-sales', 'route.ts');
const content = fs.readFileSync(apiPath, 'utf8');

console.log('📊 FULL REVENUE API:\n');
console.log(content);
