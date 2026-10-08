const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function getRealData() {
    try {
        // Products
        const products = await sql`
            SELECT 
                COUNT(*) as total,
                SUM(inventory) as total_inventory,
                SUM(inventory * price) as total_value,
                COUNT(CASE WHEN inventory = 0 THEN 1 END) as sold_out,
                COUNT(CASE WHEN inventory < 10 AND inventory > 0 THEN 1 END) as low_stock
            FROM "Product"
        `;
        
        // Orders
        const orders = await sql`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 END) as pending,
                SUM(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
                SUM(CASE WHEN status = 'processing' THEN 1 END) as processing,
                SUM(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
                SUM(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
                SUM(CASE WHEN status IN ('confirmed','processing','shipped','delivered') THEN total ELSE 0 END) as total_revenue,
                SUM(CASE WHEN "hasService" = false AND status IN ('confirmed','processing','shipped','delivered') THEN total ELSE 0 END) as product_revenue,
                SUM(CASE WHEN "hasService" = true AND status IN ('confirmed','processing','shipped','delivered') THEN "servicePrice" ELSE 0 END) as service_revenue
            FROM "Order"
        `;
        
        // Services
        const services = await sql`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN "isActive" = true THEN 1 END) as active,
                SUM(CASE WHEN status = 'confirmed' AND "hasService" = true THEN 1 END) as confirmed_services,
                SUM(CASE WHEN status = 'delivered' AND "hasService" = true THEN 1 END) as completed_services
            FROM "Service" s
            CROSS JOIN (
                SELECT status, "hasService" FROM "Order" WHERE "hasService" = true
            ) o
        `;
        
        // Users
        const users = await sql`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN "isActive" = true THEN 1 END) as active,
                SUM(CASE WHEN "isActive" = false THEN 1 END) as inactive
            FROM "User"
        `;
        
        console.log('📊 REAL DATABASE DATA:');
        console.log('\n--- PRODUCTS ---');
        console.log(`Total Products: ${products[0].total}`);
        console.log(`Total Inventory Units: ${products[0].total_inventory}`);
        console.log(`Total Inventory Worth: ₦${products[0].total_value?.toLocaleString() || 0}`);
        console.log(`Sold Out: ${products[0].sold_out}`);
        console.log(`Low Stock: ${products[0].low_stock}`);
        
        console.log('\n--- ORDERS ---');
        console.log(`Total Orders: ${orders[0].total}`);
        console.log(`Pending: ${orders[0].pending}`);
        console.log(`Confirmed: ${orders[0].confirmed}`);
        console.log(`Processing: ${orders[0].processing}`);
        console.log(`Shipped: ${orders[0].shipped}`);
        console.log(`Delivered: ${orders[0].delivered}`);
        console.log(`Total Revenue: ₦${orders[0].total_revenue?.toLocaleString() || 0}`);
        console.log(`Product Revenue: ₦${orders[0].product_revenue?.toLocaleString() || 0}`);
        console.log(`Service Revenue: ₦${orders[0].service_revenue?.toLocaleString() || 0}`);
        
        console.log('\n--- SERVICES ---');
        console.log(`Total Services: ${services[0].total}`);
        console.log(`Active Services: ${services[0].active}`);
        
        console.log('\n--- USERS ---');
        console.log(`Total Users: ${users[0].total}`);
        console.log(`Active Users: ${users[0].active}`);
        console.log(`Inactive Users: ${users[0].inactive}`);
        
    } catch (err) {
        console.error('Error:', err.message);
    }
}

getRealData();
