const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkCurrentStructure() {
    console.log('\n🔍 CURRENT PRODUCT TABLE STRUCTURE (BEFORE ANY CHANGES)\n');
    console.log('='.repeat(70));
    
    // Get ALL columns in Product table
    const columns = await sql`
        SELECT 
            column_name, 
            data_type, 
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_name = 'Product'
        ORDER BY ordinal_position
    `;
    
    console.log('\n📋 COMPLETE COLUMN LIST:\n');
    columns.forEach(col => {
        console.log(`  ${col.column_name.padEnd(20)} ${col.data_type.padEnd(15)} ${col.is_nullable === 'YES' ? 'nullable' : 'required'}`);
    });
    
    // Check for cost/purchase related columns specifically
    console.log('\n💰 COST/PRICE RELATED COLUMNS:\n');
    const costColumns = columns.filter(c => 
        c.column_name.toLowerCase().includes('cost') || 
        c.column_name.toLowerCase().includes('purchase') ||
        c.column_name.toLowerCase().includes('vendor') ||
        c.column_name.toLowerCase().includes('price')
    );
    
    if (costColumns.length > 0) {
        costColumns.forEach(col => {
            console.log(`  • ${col.column_name}: ${col.data_type}`);
        });
    } else {
        console.log('  No cost/price related columns found');
    }
    
    // Check sample data for these columns
    console.log('\n📦 SAMPLE PRODUCT DATA (with cost columns):\n');
    const sample = await sql`
        SELECT 
            id, 
            title, 
            price,
            "purchasePrice",
            "vendorPrice"
        FROM "Product"
        LIMIT 5
    `;
    
    sample.forEach(p => {
        console.log(`\n  Product ID ${p.id}: ${p.title}`);
        console.log(`    Selling Price: ₦${p.price}`);
        console.log(`    Purchase Price: ${p.purchasePrice !== null ? '₦' + p.purchasePrice : 'NOT SET'}`);
        console.log(`    Vendor Price: ${p.vendorPrice !== null ? '₦' + p.vendorPrice : 'NOT SET'}`);
    });
    
    // Check if any products have cost data
    const hasCostData = await sql`
        SELECT COUNT(*) as count
        FROM "Product"
        WHERE "purchasePrice" IS NOT NULL OR "vendorPrice" IS NOT NULL
    `;
    
    console.log(`\n\n📊 SUMMARY:`);
    console.log(`  Total products: ${columns[0] ? 'Loading...' : 'N/A'}`);
    console.log(`  Products with cost data: ${hasCostData[0].count}`);
    console.log(`  Cost columns present: ${costColumns.map(c => c.column_name).join(', ') || 'None'}`);
    
    // Recommendations based on findings
    console.log('\n💡 RECOMMENDATIONS:\n');
    if (costColumns.some(c => c.column_name === 'purchasePrice')) {
        console.log('  ✅ purchasePrice column exists - USE THIS for profit calculation');
    }
    if (costColumns.some(c => c.column_name === 'vendorPrice')) {
        console.log('  ✅ vendorPrice column exists - alternative cost source');
    }
    if (hasCostData[0].count === 0) {
        console.log('  ⚠️ No products have cost data populated yet');
        console.log('  → Need to update products with their actual purchase prices');
    }
}

checkCurrentStructure();
