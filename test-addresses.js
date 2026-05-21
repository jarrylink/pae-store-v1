const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function testAddresses() {
    try {
        // Get current user (assuming the first user for testing)
        const users = await sql`SELECT id, email FROM "User" LIMIT 1`;
        if (users.length === 0) {
            console.log('No users found');
            return;
        }
        
        const userId = users[0].id;
        console.log(`Testing addresses for user: ${users[0].email} (${userId})`);
        
        // Get addresses for this user
        const addresses = await sql`
            SELECT * FROM "Address" WHERE "userId" = ${userId}
        `;
        
        console.log(`Found ${addresses.length} addresses for this user`);
        addresses.forEach(addr => {
            console.log(`  - ID: ${addr.id}, Type: ${addr.type}, City: ${addr.city}, Default: ${addr.isDefault}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAddresses();
