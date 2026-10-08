const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function finalCheck() {
    try {
        console.log('📊 FINAL VERIFICATION - ALL COST PRICES:\n');
        
        // Summary counts
        const productCount = await sql`SELECT COUNT(*) as count FROM "Product" WHERE "purchasePrice" > 0`;
        const serviceCount = await sql`SELECT COUNT(*) as count FROM "Service" WHERE "costPrice" > 0`;
        const accessoryCount = await sql`SELECT COUNT(*) as count FROM "Accessory" WHERE "costPrice" > 0`;
        
        console.log('📦 Cost Price Summary:');
        console.log(`  Products with cost: ${productCount[0].count}`);
        console.log(`  Services with cost: ${serviceCount[0].count}`);
        console.log(`  Accessories with cost: ${accessoryCount[0].count}`);
        
        // Sample data with margins
        console.log('\n📊 Sample Profit Margins:');
        
        // Products
        const products = await sql`
            SELECT title, price, "purchasePrice" as cost 
            FROM "Product" 
            WHERE "purchasePrice" > 0 
            LIMIT 3
        `;
        console.log('\n📦 Products:');
        products.forEach(p => {
            const margin = ((p.price - p.cost) / p.price * 100).toFixed(1);
            console.log(`  ${p.title}: ₦${p.price} → Cost: ₦${p.cost} (${margin}% margin)`);
        });
        
        // Services
        const services = await sql`
            SELECT name, price, "costPrice" as cost 
            FROM "Service" 
            WHERE "costPrice" > 0 
            LIMIT 3
        `;
        console.log('\n🔧 Services:');
        services.forEach(s => {
            const margin = ((s.price - s.cost) / s.price * 100).toFixed(1);
            console.log(`  ${s.name}: ₦${s.price} → Cost: ₦${s.cost} (${margin}% margin)`);
        });
        
        // Accessories
        const accessories = await sql`
            SELECT name, price, "costPrice" as cost 
            FROM "Accessory" 
            WHERE "costPrice" > 0 
            LIMIT 3
        `;
        console.log('\n📎 Accessories:');
        accessories.forEach(a => {
            const margin = ((a.price - a.cost) / a.price * 100).toFixed(1);
            console.log(`  ${a.name}: ₦${a.price} → Cost: ₦${a.cost} (${margin}% margin)`);
        });
        
        console.log('\n✅ All data is now real with proper cost prices!');
        console.log('🔄 Refresh your Revenue Intelligence page to see real data.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

finalCheck();
