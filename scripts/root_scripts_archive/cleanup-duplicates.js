const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function cleanup() {
    console.log('\n🔧 CLEANING UP DUPLICATE COLUMNS\n');
    console.log('='.repeat(60));
    
    // Remove the duplicate costPrice column we added
    try {
        await sql`ALTER TABLE "Product" DROP COLUMN IF EXISTS "costPrice"`;
        console.log('✅ Removed duplicate costPrice column');
    } catch(e) { console.log('Note: costPrice column not found or already removed'); }
    
    // Remove the duplicate margin column
    try {
        await sql`ALTER TABLE "Product" DROP COLUMN IF EXISTS margin`;
        console.log('✅ Removed duplicate margin column');
    } catch(e) { console.log('Note: margin column not found or already removed'); }
    
    console.log('\n📋 FINAL PRODUCT TABLE COST COLUMNS:');
    const columns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'Product'
        AND (column_name ILIKE '%purchase%' OR column_name ILIKE '%vendor%' OR column_name ILIKE '%cost%')
        ORDER BY column_name
    `;
    columns.forEach(col => {
        console.log(`  • ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n✅ Cleanup complete! Using existing purchasePrice column for profit calculation.');
}

cleanup();
