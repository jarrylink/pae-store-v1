const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkUsers() {
    try {
        const users = await sql`
            SELECT id, "firstName", "lastName", email, role 
            FROM "User" 
            WHERE role IN ('staff', 'superadmin')
            ORDER BY role
        `;
        console.log('Users with staff/superadmin roles:');
        users.forEach(u => {
            console.log(`  - ${u.firstName} ${u.lastName}: ${u.role} (${u.id})`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkUsers();
