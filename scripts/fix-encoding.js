const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixEncoding() {
    try {
        console.log('🔧 Fixing encoding issues...\n');
        
        // Fix Product table
        await sql\
            UPDATE "Product" 
            SET 
                title = REPLACE(REPLACE(title, 'Ã¢â€šÂ¦', '₦'), 'Ã¢â‚¬Â¢', '•'),
                brand = REPLACE(REPLACE(brand, 'Ã¢â€šÂ¦', '₦'), 'Ã¢â‚¬Â¢', '•'),
                spec = REPLACE(REPLACE(spec, 'Ã¢â€šÂ¦', '₦'), 'Ã¢â‚¬Â¢', '•')
        \;
        console.log('✅ Fixed Product table');
        
        // Fix Accessory table
        await sql\
            UPDATE "Accessory" 
            SET 
                name = REPLACE(REPLACE(name, 'Ã¢â€šÂ¦', '₦'), 'Ã¢â‚¬Â¢', '•'),
                description = REPLACE(REPLACE(description, 'Ã¢â€šÂ¦', '₦'), 'Ã¢â‚¬Â¢', '•')
        \;
        console.log('✅ Fixed Accessory table');
        
        // Fix Service table
        await sql\
            UPDATE "Service" 
            SET 
                name = REPLACE(REPLACE(name, 'Ã¢â€šÂ¦', '₦'), 'Ã¢â‚¬Â¢', '•'),
                description = REPLACE(REPLACE(description, 'Ã¢â€šÂ¦', '₦'), 'Ã¢â‚¬Â¢', '•')
        \;
        console.log('✅ Fixed Service table');
        
        console.log('\n✅ All encoding issues fixed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixEncoding();
