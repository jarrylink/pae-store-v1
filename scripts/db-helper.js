// db-helper.js - Database access via PowerShell
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load DATABASE_URL from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

if (!DATABASE_URL) {
    console.error('? DATABASE_URL not found in .env.local');
    process.exit(1);
}

// Initialize Neon connection
const sql = neon(DATABASE_URL);

// Export for use in other scripts
module.exports = { sql, DATABASE_URL };

// If run directly, test the connection
if (require.main === module) {
    (async () => {
        try {
            console.log('? Connected to Neon database');
            // Use template literal with backticks
            const result = await sql\SELECT NOW() as current_time\;
            console.log('?? Database time:', result[0].current_time);
        } catch (error) {
            console.error('? Connection failed:', error.message);
        }
    })();
}
