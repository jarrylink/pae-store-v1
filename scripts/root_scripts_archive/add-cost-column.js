const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function addCostColumn() {
    console.log('\n💰 ADDING COST PRICE COLUMN TO PRODUCT TABLE\n');
    console.log('='.repeat(60));
    
    // Add costPrice column
    await sql`
        ALTER TABLE "Product" 
        ADD COLUMN IF NOT EXISTS "costPrice" DECIMAL(12,2) DEFAULT 0
    `;
    console.log('✅ Added costPrice column');
    
    // Add purchasePrice as alias (for clarity)
    await sql`
        ALTER TABLE "Product" 
        ADD COLUMN IF NOT EXISTS "purchasePrice" DECIMAL(12,2) DEFAULT 0
    `;
    console.log('✅ Added purchasePrice column');
    
    // Add margin percentage (calculated field)
    await sql`
        ALTER TABLE "Product" 
        ADD COLUMN IF NOT EXISTS "margin" DECIMAL(5,2) GENERATED ALWAYS AS (
            CASE 
                WHEN price > 0 AND "costPrice" > 0 
                THEN ((price - "costPrice") / price) * 100 
                ELSE 0 
            END
        ) STORED
    `;
    console.log('✅ Added margin (auto-calculated)');
    
    console.log('\n📋 NEW PRODUCT TABLE STRUCTURE:');
    const columns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'Product'
        ORDER BY ordinal_position
    `;
    columns.forEach(col => {
        console.log(`  • ${col.column_name}: ${col.data_type}`);
    });
}

addCostColumn();
