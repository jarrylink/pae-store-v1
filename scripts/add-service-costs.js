const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function addServiceCosts() {
    try {
        console.log('🔧 Adding cost prices to services...\n');
        
        const services = await sql`
            SELECT id, name, price FROM "Service" WHERE "costPrice" = 0
        `;
        
        console.log(`Found ${services.length} services without cost prices:\n`);
        
        for (const s of services) {
            // Different margins for different service types
            let costPercentage = 0.55; // Default 55%
            
            if (s.name.toLowerCase().includes('installation')) {
                costPercentage = 0.50; // 50% for installation (higher labor cost)
            } else if (s.name.toLowerCase().includes('maintenance')) {
                costPercentage = 0.45; // 45% for maintenance
            } else if (s.name.toLowerCase().includes('material')) {
                costPercentage = 0.65; // 65% for materials
            } else if (s.name.toLowerCase().includes('repair')) {
                costPercentage = 0.40; // 40% for repairs
            }
            
            const costPrice = Math.round(Number(s.price) * costPercentage);
            
            await sql`
                UPDATE "Service" 
                SET "costPrice" = ${costPrice} 
                WHERE id = ${s.id}
            `;
            
            const margin = ((Number(s.price) - costPrice) / Number(s.price) * 100).toFixed(1);
            console.log(`  ✅ ${s.name}: ₦${s.price} → Cost: ₦${costPrice} (${margin}% margin)`);
        }
        
        console.log('\n✅ All service cost prices added!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

addServiceCosts();
