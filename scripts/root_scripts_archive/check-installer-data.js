const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkInstallerData() {
    console.log('\n📁 INSTALLER TABLES:\n');
    
    // Check all tables
    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    `;
    
    console.log('All tables:', tables.map(t => t.table_name).join(', '));
    
    // Check Installer table
    const installerExists = await sql`
        SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Installer')
    `;
    
    if (installerExists[0].exists) {
        const installers = await sql`SELECT * FROM "Installer" LIMIT 5`;
        console.log('\n📊 Installer data:', installers);
    } else {
        console.log('\n❌ No Installer table found');
    }
    
    // Check for service/installation jobs
    const serviceExists = await sql`
        SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Service')
    `;
    
    if (serviceExists[0].exists) {
        const services = await sql`SELECT * FROM "Service" LIMIT 5`;
        console.log('\n🔧 Service data:', services);
    }
    
    // Check Order table for service-related orders
    const serviceOrders = await sql`
        SELECT id, status, total, "createdAt", "assignedStaffName"
        FROM "Order"
        WHERE "hasService" = true OR "serviceId" IS NOT NULL
        LIMIT 5
    `;
    console.log('\n📦 Service orders:', serviceOrders);
}

checkInstallerData();
