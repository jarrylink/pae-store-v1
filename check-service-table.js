const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkServiceTable() {
    try {
        // Get service table columns
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Service'
            ORDER BY ordinal_position
        `;
        
        console.log('📋 Service Table Columns:');
        console.table(columns);
        
        // Get service counts
        const totalServices = await sql`SELECT COUNT(*) FROM "Service"`;
        console.log(`\n📊 Total Services: ${totalServices[0].count}`);
        
        // Get active services
        const activeServices = await sql`
            SELECT COUNT(*) FROM "Service" WHERE "isActive" = true
        `;
        console.log(`✅ Active Services: ${activeServices[0].count}`);
        
        // Get sample services
        const services = await sql`
            SELECT id, name, price, "isActive", category
            FROM "Service"
            LIMIT 5
        `;
        
        console.log('\n🔧 Sample Services:');
        console.table(services);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

checkServiceTable();
