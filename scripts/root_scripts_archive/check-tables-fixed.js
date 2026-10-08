const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkTables() {
    console.log('\n📋 ALL TABLES IN DATABASE:\n');
    
    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    `;
    
    tables.forEach(t => {
        console.log(`  • ${t.table_name}`);
    });
    
    // Check Order table structure
    console.log('\n📊 ORDER TABLE COLUMNS:');
    const orderCols = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'Order'
        ORDER BY ordinal_position
    `;
    orderCols.forEach(col => {
        console.log(`  • ${col.column_name}: ${col.data_type}`);
    });
    
    // Check Vendor table structure
    console.log('\n🏢 VENDOR TABLE COLUMNS:');
    const vendorCols = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'Vendor'
        ORDER BY ordinal_position
    `;
    vendorCols.forEach(col => {
        console.log(`  • ${col.column_name}: ${col.data_type}`);
    });
    
    // Check User table structure
    console.log('\n👥 USER TABLE COLUMNS:');
    const userCols = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'User'
        ORDER BY ordinal_position
    `;
    userCols.slice(0, 15).forEach(col => {
        console.log(`  • ${col.column_name}: ${col.data_type}`);
    });
    
    // Check Product table structure
    console.log('\n📦 PRODUCT TABLE COLUMNS:');
    const productCols = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'Product'
        ORDER BY ordinal_position
    `;
    productCols.slice(0, 15).forEach(col => {
        console.log(`  • ${col.column_name}: ${col.data_type}`);
    });
}

checkTables();
