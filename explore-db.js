const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function exploreDatabase() {
    try {
        console.log('🔍 Exploring Database Current State');
        console.log('=====================================');
        
        // Check all tables
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;
        
        console.log('\n📁 Tables in database:');
        tables.forEach(t => console.log(`  - ${t.table_name}`));
        
        // Check Users
        const users = await sql`SELECT id, email, role, "isActive" FROM "User" ORDER BY email`;
        console.log(`\n👥 Users (${users.length}):`);
        users.forEach(u => console.log(`  - ${u.email} (${u.role}) - Active: ${u.isActive}`));
        
        // Check Orders
        const orders = await sql`SELECT id, "orderNumber", status, "userId" FROM "Order" ORDER BY id`;
        console.log(`\n📦 Orders (${orders.length}):`);
        orders.forEach(o => console.log(`  - ID: ${o.id}, #${o.orderNumber}, Status: ${o.status}`));
        
        // Check Addresses
        const addresses = await sql`SELECT id, "userId", type, city FROM "Address" ORDER BY id`;
        console.log(`\n🏠 Addresses (${addresses.length}):`);
        addresses.forEach(a => console.log(`  - ID: ${a.id}, User: ${a.userId}, Type: ${a.type}, City: ${a.city}`));
        
        // Check Products
        const products = await sql`SELECT id, title, inventory FROM "Product" ORDER BY id`;
        console.log(`\n📦 Products (${products.length}):`);
        products.forEach(p => console.log(`  - ID: ${p.id}, ${p.title}, Stock: ${p.inventory}`));
        
        // Check Services
        const services = await sql`SELECT id, name, "isActive" FROM "Service" ORDER BY id`;
        console.log(`\n🔧 Services (${services.length}):`);
        services.forEach(s => console.log(`  - ID: ${s.id}, ${s.name}, Active: ${s.isActive}`));
        
        // Check ActivityLog
        const logs = await sql`SELECT COUNT(*) as count FROM "ActivityLog"`;
        console.log(`\n📝 Activity Logs: ${logs[0].count} entries`);
        
        // Get sequence info for Order id
        const orderSeq = await sql`
            SELECT pg_get_serial_sequence('"Order"', 'id') as seq_name
        `;
        if (orderSeq[0].seq_name) {
            const seqVal = await sql`
                SELECT currval(${orderSeq[0].seq_name}) as current_val
            `;
            console.log(`\n🔄 Order ID sequence current value: ${seqVal[0]?.current_val || 'not set'}`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

exploreDatabase();
