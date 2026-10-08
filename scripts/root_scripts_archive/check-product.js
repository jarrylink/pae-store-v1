const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkProduct() {
    console.log('\n🔍 PRODUCT TABLE STRUCTURE\n');
    console.log('='.repeat(60));
    
    // Get all columns in Product table
    const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'Product'
        ORDER BY ordinal_position
    `;
    
    console.log('\n📋 CURRENT PRODUCT TABLE COLUMNS:\n');
    columns.forEach(col => {
        console.log(`  • ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
    });
    
    // Check if cost/expenses column exists
    const hasCost = columns.some(c => c.column_name.toLowerCase().includes('cost') || c.column_name.toLowerCase().includes('expense'));
    
    console.log(`\n💰 COST/EXPENSES COLUMN EXISTS: ${hasCost ? 'YES' : 'NO'}`);
    
    if (!hasCost) {
        console.log('\n⚠️ MISSING: costPrice or expenses column needed for profit calculation');
    }
    
    // Sample product data
    const sample = await sql`
        SELECT id, title, price FROM "Product" LIMIT 5
    `;
    
    console.log('\n📦 SAMPLE PRODUCTS:');
    sample.forEach(p => {
        console.log(`  ID ${p.id}: ${p.title} - ₦${p.price}`);
    });
}

checkProduct();
