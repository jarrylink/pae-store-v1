const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkServices() {
    console.log('?? Checking services in database...\n');
    
    const services = await sql
        SELECT id, name, description, price, category, duration, image, "isActive"
        FROM "Service"
        WHERE "isActive" = true
        ORDER BY name ASC
    ;
    
    console.log(?? Found  active services:);
    services.forEach(s => {
        console.log(   - : ? ());
    });
}

checkServices();
