const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkOrderSchema() {
    try {
        // Get all columns in Order table
        const columns = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'Order'
            ORDER BY ordinal_position
        `;
        
        console.log('📋 Order Table Columns:');
        console.table(columns);
        
        // Check if hasService column exists
        const hasServiceColumn = columns.some(c => c.column_name === 'hasService');
        console.log(`\n🔍 hasService column exists: ${hasServiceColumn ? 'YES' : 'NO'}`);
        
        // Get a sample order to see actual data
        const sampleOrder = await sql`
            SELECT id, "orderNumber", total, status, "paymentStatus", items
            FROM "Order" 
            LIMIT 1
        `;
        
        if (sampleOrder.length > 0) {
            console.log('\n📦 Sample Order:');
            console.log(JSON.stringify(sampleOrder[0], null, 2));
            
            // Check if items contain service information (without TypeScript)
            let items = sampleOrder[0].items;
            if (typeof items === 'string') {
                items = JSON.parse(items);
            }
            const hasServiceInItems = items && Array.isArray(items) && items.some(function(item) {
                return item.type === 'service';
            });
            console.log(`\n🔧 Service in items: ${hasServiceInItems ? 'YES' : 'NO'}`);
            
            // Show first item to understand structure
            if (items && items.length > 0) {
                console.log('\n📦 First item structure:', JSON.stringify(items[0], null, 2));
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

checkOrderSchema();
