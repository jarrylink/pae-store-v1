const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkExisting() {
    console.log('\n🔍 CHECKING EXISTING COST-RELATED COLUMNS\n');
    console.log('='.repeat(60));
    
    // Check what cost/purchase columns exist
    const costColumns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'Product'
        AND (column_name ILIKE '%cost%' 
          OR column_name ILIKE '%purchase%' 
          OR column_name ILIKE '%vendor%'
          OR column_name ILIKE '%price%')
        ORDER BY column_name
    `;
    
    console.log('\n💰 EXISTING PRICE/COST COLUMNS:\n');
    costColumns.forEach(col => {
        console.log(`  • ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
    });
    
    // Check if any products have purchasePrice or vendorPrice values
    const sampleWithCost = await sql`
        SELECT id, title, price, "purchasePrice", "vendorPrice"
        FROM "Product"
        WHERE "purchasePrice" IS NOT NULL OR "vendorPrice" IS NOT NULL
        LIMIT 5
    `;
    
    console.log('\n📦 PRODUCTS WITH COST DATA:\n');
    if (sampleWithCost.length > 0) {
        sampleWithCost.forEach(p => {
            console.log(`  ID ${p.id}: ${p.title}`);
            console.log(`    Selling Price: ₦${p.price}`);
            console.log(`    Purchase Price: ₦${p.purchasePrice || 'NOT SET'}`);
            console.log(`    Vendor Price: ₦${p.vendorPrice || 'NOT SET'}`);
            console.log('');
        });
    } else {
        console.log('  No products have purchasePrice or vendorPrice set yet');
        console.log('  ⚠️ Need to update existing products with cost data for profit calculation');
    }
    
    // Check what we added
    const newColumns = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'Product'
        AND column_name IN ('costPrice', 'margin')
    `;
    
    console.log('\n🆕 NEWLY ADDED COLUMNS (may be duplicates):');
    newColumns.forEach(col => {
        console.log(`  • ${col.column_name} (added by script - possibly duplicate of purchasePrice)`);
    });
}

checkExisting();
