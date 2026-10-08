const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
    console.log('🔍 Checking Order 29 Accessories\n');
    
    try {
        // Check if order 29 has accessories in OrderAccessory table
        const result = await sql`
            SELECT COUNT(*) as count 
            FROM "OrderAccessory" 
            WHERE "orderId" = 29
        `;
        console.log('Accessories in OrderAccessory table:', result[0].count);
        
        // Get the actual accessories
        const accessories = await sql`
            SELECT 
                oa.*,
                a.name
            FROM "OrderAccessory" oa
            LEFT JOIN "Accessory" a ON oa."accessoryId" = a.id
            WHERE oa."orderId" = 29
        `;
        
        if (accessories.length > 0) {
            console.log('\n📦 Accessories found:');
            accessories.forEach(a => {
                console.log(`   - ${a.name}: ${a.quantity} × ₦${a.unit_price}`);
            });
        } else {
            console.log('\n❌ No accessories found for order 29');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

check();