const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
}

console.log('🔍 Testing database connection...');

const sql = neon(DATABASE_URL, {
    fetchOptions: { 
        timeout: 60000, // Increase timeout to 60 seconds
        connectTimeout: 60000
    }
});

async function testConnection() {
    try {
        const result = await sql`SELECT NOW() as current_time`;
        console.log('✅ Database connected successfully!');
        console.log('Server time:', result[0].current_time);
        
        // Test a simple query
        const productCount = await sql`SELECT COUNT(*) as count FROM "Product"`;
        console.log('📦 Total products:', productCount[0].count);
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        if (error.cause) {
            console.error('Cause:', error.cause.message);
        }
    }
}

testConnection();
