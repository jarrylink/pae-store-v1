const fs = require('fs');
const path = require('path');

const adminAccessoryPath = path.join(__dirname, '..', 'src', 'app', 'admin', 'accessories', 'page.tsx');
let content = fs.readFileSync(adminAccessoryPath, 'utf8');

// Add costPrice to form state initialization
content = content.replace(
    /const \[formData, setFormData\] = useState\({[^}]*}\)/,
    `const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    sku: '',
    unit: 'piece',
    stock: 0,
    isActive: true,
    costPrice: ''
  })`
);

// Add costPrice input field after price field
content = content.replace(
    /(<div>\s*<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price<\/label>[\s\S]*?<\/div>)/,
    `$1
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cost Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Cost price for profit calculation
                </p>
              </div>`
);

// Add costPrice to the form data being sent for PUT
content = content.replace(
    /const response = await fetch\(`\/api\/accessories\/\${editingAccessory\.id}`/,
    `const response = await fetch(\`/api/accessories/\${editingAccessory.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, costPrice: parseFloat(formData.costPrice) || 0 })
      });`
);

// Also update the POST for new accessories
content = content.replace(
    /await fetch\('\/api\/accessories', {[\s\S]*?body: JSON\.stringify\(formData\)[\s\S]*?}\)/,
    `await fetch('/api/accessories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, costPrice: parseFloat(formData.costPrice) || 0 })
      })`
);

fs.writeFileSync(adminAccessoryPath, content, 'utf8');
console.log('✅ Updated Admin Accessory form with costPrice');
