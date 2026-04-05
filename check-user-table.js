const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkUserTable() {
    try {
        // Get user table columns
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'User'
            ORDER BY ordinal_position
        `;
        
        console.log('📋 User Table Columns:');
        console.table(columns);
        
        // User counts
        const totalUsers = await sql`SELECT COUNT(*) FROM "User"`;
        console.log(`\n👥 Total Users: ${totalUsers[0].count}`);
        
        // Active vs Inactive users
        const userStatus = await sql`
            SELECT 
                COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_users,
                COUNT(CASE WHEN "isActive" = false THEN 1 END) as inactive_users
            FROM "User"
        `;
        
        console.log(`✅ Active Users: ${userStatus[0].active_users || 0}`);
        console.log(`❌ Inactive Users: ${userStatus[0].inactive_users || 0}`);
        
        // Users by role
        const userRoles = await sql`
            SELECT role, COUNT(*) as count 
            FROM "User" 
            GROUP BY role
        `;
        
        console.log('\n👑 Users by Role:');
        console.table(userRoles);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUserTable();
