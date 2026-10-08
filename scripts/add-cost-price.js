const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function addCostPrice() {
    console.log('\n🔧 Adding costPrice columns to tables...\n');
    
    try {
        // Check if Service table has costPrice
        const serviceCheck = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Service' AND column_name = 'costPrice'
        `;
        
        if (serviceCheck.length === 0) {
            await sql`
                ALTER TABLE "Service" 
                ADD COLUMN "costPrice" DECIMAL(10,2) DEFAULT 0
            `;
            console.log('✅ Added costPrice to Service table');
        } else {
            console.log('ℹ️ costPrice already exists in Service table');
        }
        
        // Check if Accessory table has costPrice
        const accessoryCheck = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Accessory' AND column_name = 'costPrice'
        `;
        
        if (accessoryCheck.length === 0) {
            await sql`
                ALTER TABLE "Accessory" 
                ADD COLUMN "costPrice" DECIMAL(10,2) DEFAULT 0
            `;
            console.log('✅ Added costPrice to Accessory table');
        } else {
            console.log('ℹ️ costPrice already exists in Accessory table');
        }
        
        // Verify all columns
        console.log('\n📊 VERIFYING COLUMNS:\n');
        
        const serviceCols = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Service'
            ORDER BY ordinal_position
        `;
        console.log('Service table columns:');
        serviceCols.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type}`);
        });
        
        const accessoryCols = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Accessory'
            ORDER BY ordinal_position
        `;
        console.log('\nAccessory table columns:');
        accessoryCols.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type}`);
        });
        
        console.log('\n✅ All done!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

addCostPrice();
