const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function renameColumn() {
    console.log('\n🔄 RENAMING costPrice TO expenses\n');
    console.log('='.repeat(60));
    
    // Check if costPrice exists
    const hasCostPrice = await sql`
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'Product' AND column_name = 'costPrice'
        )
    `;
    
    if (hasCostPrice[0].exists) {
        // Rename the column
        await sql`
            ALTER TABLE "Product" 
            RENAME COLUMN "costPrice" TO "expenses"
        `;
        console.log('✅ Renamed costPrice → expenses');
    } else {
        console.log('⚠️ costPrice column not found, creating expenses column instead');
        await sql`
            ALTER TABLE "Product" 
            ADD COLUMN IF NOT EXISTS "expenses" DECIMAL(12,2) DEFAULT 0
        `;
        console.log('✅ Created expenses column');
    }
    
    // Verify the rename worked
    const columns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'Product'
        AND column_name IN ('purchasePrice', 'vendorPrice', 'expenses', 'price')
        ORDER BY column_name
    `;
    
    console.log('\n📋 COST-RELATED COLUMNS NOW:\n');
    columns.forEach(col => {
        console.log(`  • ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n💡 COST BREAKDOWN EXPLANATION:');
    console.log('  purchasePrice = What you paid the supplier');
    console.log('  expenses = Transport, assembly, repackaging, customs, etc.');
    console.log('  vendorPrice = Alternative supplier pricing (optional)');
    console.log('  TOTAL COST = purchasePrice + expenses');
}

renameColumn();
