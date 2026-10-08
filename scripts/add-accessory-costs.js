const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function addAccessoryCosts() {
    try {
        console.log('📎 Adding cost prices to accessories...\n');
        
        const accessories = await sql`
            SELECT id, name, price FROM "Accessory" WHERE "costPrice" = 0
        `;
        
        console.log(`Found ${accessories.length} accessories without cost prices:\n`);
        
        for (const a of accessories) {
            // Different margins for different accessory types
            let costPercentage = 0.55; // Default 55%
            
            if (a.name.toLowerCase().includes('cable')) {
                costPercentage = 0.60; // 60% for cables
            } else if (a.name.toLowerCase().includes('device')) {
                costPercentage = 0.50; // 50% for devices
            } else if (a.name.toLowerCase().includes('switch')) {
                costPercentage = 0.55; // 55% for switches
            } else if (a.name.toLowerCase().includes('regulator')) {
                costPercentage = 0.50; // 50% for regulators
            }
            
            const costPrice = Math.round(Number(a.price) * costPercentage);
            
            await sql`
                UPDATE "Accessory" 
                SET "costPrice" = ${costPrice} 
                WHERE id = ${a.id}
            `;
            
            const margin = ((Number(a.price) - costPrice) / Number(a.price) * 100).toFixed(1);
            console.log(`  ✅ ${a.name}: ₦${a.price} → Cost: ₦${costPrice} (${margin}% margin)`);
        }
        
        console.log('\n✅ All accessory cost prices added!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

addAccessoryCosts();
